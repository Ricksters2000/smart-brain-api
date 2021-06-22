begin transaction;

insert into users (name, email, entries, joined) 
values ('someguy', 'someguy@gmail.com', 5, 'Jan-01-2000');

-- insert into login (hash, email) 
-- values ('$2a$10$pfW/9ZI8xHdCyepCnktUHeWTvGa5hkGui.z0xHzCaG9VImxFmqYQ6$2a$10$w5lly0JWd9YxcWG1jmrmq.sTSB6Es13n/MuKrSgI2/K9iyoY9AuFi', 'someguy@gmail.com');

insert into login (hash, email) 
values ('$2a$10$pfW/9ZI8xHdCyepCnktUHeWTvGa5hkGui', 'someguy@gmail.com');


commit;