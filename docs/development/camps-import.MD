# Importing camps data

This method can be used to do the yearly manual import of camps data to spark DB

## Input Data

The input data is an excel or google sheet with the following columns:

* camp_name_he
* camp_name_en
* camp_leader_name
* camp_leader_email

## import process

* login to adminer, create a new table for this event's camps data
  * **set collation to UTF-8**
* using adminer UI - import the camp data as CSV (or export from existing DB which has the data)
* remove leading/trailing whitespaces which might interefere with relation to users table
  * `update camps_2018 set camp_leader_email=trim(camp_leader_email)`
* Insert users for camp leaders which don't already have a spark user:
```
insert into users (name, email, roles) 
select camp_leader_name, camp_leader_email, 'camp_manager' 
from camps_2018 where camp_leader_email not in (select email from users)
```
* Insert the camps, with relation to users
```
insert into camps (event_id, __prototype, camp_name_he, camp_name_en, main_contact)
select 'MIDBURN2018', 'theme_camp', camps_2018.camp_name_he, camps_2018.camp_name_en, users.user_id
from camps_2018, users
where camps_2018.camp_leader_email = users.email
```
* update camp_id in users table to the 2018 camps
```
update users set camp_id=(select id from camps where main_contact=users.user_id and event_id='MIDBURN2018') 
where email in (select camp_leader_email from camps_2018)
```
* insert the camp leaders as camp members
```
insert into camp_members (camp_id, user_id, status)
select id, main_contact, 'approved_mgr' from camps where event_id='MIDBURN2018'
```
* update all contact person ids to the leader user id
```
update camps set contact_person_id=main_contact, moop_contact=main_contact, safety_contact=main_contact where event_id='MIDBURN2018';
```
* update all camp status to open (if status field is null it causes problems in spark)
```
update camps set status='open' where event_id='MIDBURN2018';
```


## Importing additional camps

* edit `camps_2018` table and add `import_group` column with default value of `1`
* prepare import csv file for the additional camps with the additional `import_group` column with value of `2`
* import the additional camps using adminer
* continue import process, but add ` and import_group=2` to all where queries of `camps_2018` table:

```
update camps_2018 set camp_leader_email=trim(camp_leader_email) where import_group=2;

insert into users (name, email, roles)
select camp_leader_name, camp_leader_email, 'camp_manager' 
from camps_2018 where camp_leader_email not in (select email from users) and import_group=2;

insert into camps (event_id, __prototype, camp_name_he, camp_name_en, main_contact)
select 'MIDBURN2018', 'theme_camp', camps_2018.camp_name_he, camps_2018.camp_name_en, users.user_id
from camps_2018, users
where camps_2018.camp_leader_email = users.email and camps_2018.import_group=2;

update users set camp_id=(select id from camps where main_contact=users.user_id and event_id='MIDBURN2018') 
where email in (select camp_leader_email from camps_2018 where import_group=2);

insert into camp_members (camp_id, user_id, status)
select id, main_contact, 'approved_mgr' from camps where event_id='MIDBURN2018' and camp_name_he in (select camp_name_he from camps_2018 where import_group=2);

update camps set contact_person_id=main_contact, moop_contact=main_contact, safety_contact=main_contact where event_id='MIDBURN2018' and camp_name_he in (select camp_name_he from camps_2018 where import_group=2);

update camps set status='open' where event_id='MIDBURN2018' and camp_name_he in (select camp_name_he from camps_2018 where import_group=2);
```
