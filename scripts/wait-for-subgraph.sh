while :
do
  LOG=$(docker-compose logs --tail=8 graph-node)

  if [[ "$LOG" == *"database system is starting up"* ]]; then
    sleep 2
  elif [[ "$LOG" == *"wait-for-it.sh"* ]]; then
    sleep 2
  else
    break
  fi
done
