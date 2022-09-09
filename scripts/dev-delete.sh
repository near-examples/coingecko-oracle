# should be called like this: ./dev-delete.sh <delete-account-name> <master-account-name>
printf 'y\n' | near delete $1 $2
