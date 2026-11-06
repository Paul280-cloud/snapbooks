-- T-SETUP-2: pgTAP runs and the public schema exists
BEGIN;

SELECT plan(1);

SELECT has_schema('public', 'The public schema exists');

SELECT * FROM finish();

ROLLBACK;
