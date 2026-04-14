const fp = require('fastify-plugin');
const { createClient } = require('@supabase/supabase-js');

module.exports = fp(async (fastify) => {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    // HOOK 1: Para peticiones exitosas o terminadas (Logs y Métricas)
    fastify.addHook('onResponse', async (request, reply) => {
        if (request.method === 'OPTIONS') return;

        const endpoint = request.url;
        const responseTime = parseFloat(reply.elapsedTime.toFixed(2));

        // 1. Guardar el LOG
        await supabase.from('gateway_logs').insert([{
            endpoint,
            metodo: request.method,
            usuario_id: request.user?.id || null,
            ip: request.ip,
            status_http: reply.statusCode,
            tiempo_respuesta: responseTime
        }]);

        // 2. ACTUALIZAR MÉTRICAS
        try {
            const { data: currentMetric } = await supabase
                .from('gateway_metrics')
                .select('total_request')
                .eq('endpoint', endpoint)
                .single();

            if (currentMetric) {
                await supabase.from('gateway_metrics').update({
                    total_request: parseInt(currentMetric.total_request) + 1,
                    latencia_ms: responseTime,
                    actualizado_en: new Date().toISOString()
                }).eq('endpoint', endpoint);
            } else {
                await supabase.from('gateway_metrics').insert([{
                    endpoint: endpoint,
                    total_request: 1,
                    latencia_ms: responseTime,
                    actualizado_en: new Date().toISOString()
                }]);
            }
        } catch (err) {
            console.error('Error al actualizar gateway_metrics:', err.message);
        }
    });

    // HOOK 2: Para capturar errores críticos (Punto extra: Stack Traces)
    fastify.addHook('onError', async (request, reply, error) => {
        await supabase.from('gateway_logs').insert([{
            endpoint: request.url,
            metodo: request.method,
            usuario_id: request.user?.id || null,
            ip: request.ip,
            status_http: 500,
            error_stack: error.stack // Aquí se guarda el rastro del error
        }]);
    });
});