THREADS=50
TASKS=5000
ab -c $THREADS -n $TASKS http://45.32.83.93/api/msg/111,222
#-T "application/json" -H "X-ApiKey: $RAYGUN_APIKEY" -p example.json
