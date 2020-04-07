while :
do
  STR=$(docker-compose logs --tail=8 graph-node)

  if [[ "$STR" == *"database system is starting up"* ]]; then
    echo "It's there."
  else
    break
  fi
done
