# sis-kurki-integration

## Development setup

1. Create a directory for the Oracle Database's files:

```
mkdir ~/oracle_data
```

2. Create a `.env` file in the root directory with contents of the `.env.template` file. Replace the `KURKI_DB_*` environment variables values with the database connection configuration. These variables are suitable for the development database:

```
KURKI_DB_USER=system
KURKI_DB_PASSWORD=oracle
KURKI_DB_CONNECTION_STRING=host.docker.internal:1521/xe
```

3. Build the docker image by running `docker-compose up --build`

---

If you face the following error with the database connection:

```
TNS:listener: all appropriate instances are in restricted mode
```

Use [sqlplus](https://zwbetz.com/install-sqlplus-on-a-mac/) to connect to the database:

```
sqlplus sys/oracle@localhost:1521/xe as sysdba
```

And run the following command:

```sql
ALTER SYSTEM DISABLE RESTRICTED SESSION;
```

## Connecting to the production database

1. Set correct database configuration in the `.env` file 
2. When running, start the tunnel with `npm run tunnel`