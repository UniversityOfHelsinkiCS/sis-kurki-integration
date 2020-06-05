# sis-kurki-integration

## Development setup

1. Install and run Oracle Database e.g. with [Oracle Database Enterprise Edition](https://hub.docker.com/_/oracle-database-enterprise-edition) Docker image.
2. Create a `.env` file in the root directory with contents of the `.env.template` file. Replace the `KURKI_DB_*` environment variables values with the database connection configuration.
3. Build the docker image by running `docker build -t sis-kurki-integration .`
4. Run the image by running `docker run sis-kurki-integration`.
