# This is a extreme case script, it will slow down your development process
# Try "docker-compose up --build" first, it will probably serve you better
# I have only created this script so I can ensure that there's no residuals
# that are making the project work on my local machine but won't on production

# This script requires sudo
if [ $(whoami) != "root" ]
then
	echo "Please run this script with sudo:"
	echo "sudo $0 $*"
	exit 1
fi

# Stop running docker composer
docker compose down

# Clean every docker container, image, network, etc..
docker system prune -a

# Recreate volume folder
rm -rf mysql
mkdir mysql

# Spin up docker compose, there's no need to requiring --build since we just
# deleted every docker image from our docker host when executing docker prune
docker-compose up -d
