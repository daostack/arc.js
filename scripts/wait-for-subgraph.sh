while :
do
  STR=$(docker-compose logs --tail=8 graph-node)

  if [[ "$STR" == *"database system is starting up"* ]]; then
    sleep 2
  else
    break
  fi
done
