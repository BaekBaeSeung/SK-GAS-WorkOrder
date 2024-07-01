
-- 데이터 베이스 삭제
Drop database test03;

-- 데이터베이스 생성
CREATE DATABASE test03;

-- 데이터베이스 사용
USE test03;

-- User 테이블 생성
CREATE TABLE User (
    user_id UUID PRIMARY KEY,
    role ENUM('ADMIN', 'USER'),
    onOffState ENUM('ONLINE', 'OFFLINE'),
    state ENUM('정지', '정상', '기타'),
    name VARCHAR(255),
    team_name VARCHAR(255),
    profile_pic VARCHAR(255),
    email VARCHAR(255),
    pw VARCHAR(255),
    phone_number VARCHAR(255),
    last_login DATETIME
);

-- ChattingRoom 테이블 생성
CREATE TABLE ChattingRoom (
    chatting_room_id UUID PRIMARY KEY,
    participants TEXT,
    chatroom_type ENUM('1:1', '1:N'),
    recent_message TEXT,
    create_at DATETIME,
    update_at DATETIME
);

-- Relationship 중간 테이블 생성
CREATE TABLE Relationship (
    user_id UUID,
    chatting_room_id UUID,
    PRIMARY KEY (user_id, chatting_room_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (chatting_room_id) REFERENCES ChattingRoom(chatting_room_id)
);
-- Notice 테이블 생성
CREATE TABLE Notice (
    notice_id UUID PRIMARY KEY,
    user_id UUID,
    content TEXT,
    create_at DATETIME,
    updated_at DATETIME,
    importance ENUM('LOW', 'MEDIUM', 'HIGH'),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

-- WorkingArea 테이블 생성
CREATE TABLE WorkingArea (
    area_id UUID PRIMARY KEY,
    area_name VARCHAR(255)
);

-- Section 테이블 생성
CREATE TABLE Section (
    section_id UUID PRIMARY KEY,
    area_id UUID,
    section VARCHAR(255),
    section_Info TEXT,
    image VARCHAR(255),
    FOREIGN KEY (area_id) REFERENCES WorkingArea(area_id)
);
-- SubSection 테이블 생성
CREATE TABLE SubSection (
    subSection_id UUID PRIMARY KEY,
    section_id UUID,
    subSection_name VARCHAR(255),
    item_no VARCHAR(255),
    section_unit VARCHAR(255),
    item_pic VARCHAR(255), -- 사진 URL을 저장할 컬럼 추가
    FOREIGN KEY (section_id) REFERENCES Section(section_id)
);

delete from workingtime;
-- WorkingTime 테이블 생성
CREATE TABLE WorkingTime (
    work_time_id UUID PRIMARY KEY,
    area_id UUID,
    schedule_type VARCHAR(255),
    time VARCHAR(255),
    FOREIGN KEY (area_id) REFERENCES WorkingArea(area_id)
);


-- WorkingDetail 테이블 생성
CREATE TABLE WorkingDetail (
    working_detail_id UUID PRIMARY KEY,
    work_time_id UUID,
    value VARCHAR(255),
    create_at DATETIME,
    section VARCHAR(255),
    user_id UUID,
    time TIME,
    schedule_type VARCHAR(50),
    FOREIGN KEY (work_time_id) REFERENCES WorkingTime(work_time_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

-- schedule 테이블 생성
CREATE TABLE schedule (
    schedule_id UUID PRIMARY KEY,
    area_name VARCHAR(255),
    section VARCHAR(255),
    schedule_type ENUM('m', 's', 'n'),
    time VARCHAR(255),
    create_at DATETIME,
    user_id UUID,
    foreman UUID,
    worker UUID,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (foreman) REFERENCES User(user_id),
    FOREIGN KEY (worker) REFERENCES User(user_id)
);

-- token 테이블 생성 사용중은 아님.------------------------------------------------------
CREATE TABLE Token (
    token_id UUID PRIMARY KEY,
    user_id UUID,
    token TEXT,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

-- Chat 테이블 생성
CREATE TABLE Chat (
    message_id UUID PRIMARY KEY,
    chatting_room_id UUID,
    user_id UUID,
    message_type ENUM('TEXT', 'IMAGE', 'FILE'),
    content TEXT,
    time_stamp DATETIME,
    read_status BOOLEAN,
    attachment VARCHAR(255),
    FOREIGN KEY (chatting_room_id) REFERENCES ChattingRoom(chatting_room_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
    
    
    
    -- NoticeRead 테이블 생성 공지를 읽었는지 안읽었는지
    CREATE TABLE NoticeRead (
    notice_read_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    notice_id UUID NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (notice_id) REFERENCES Notice(notice_id)
);
    
    -- User 더미 데이터 삽입
   INSERT INTO User (user_id, role, onOffState, state, name, team_name, profile_pic, email, pw, phone_number, last_login)
VALUES
    (UUID(), 'ADMIN', 'ONLINE', '정상', '나관리', '팀A', 'profile1.png', 'admin01@example.com', 'password', '010-1234-5678', '2023-10-01 10:00:00'),
	(UUID(), 'USER', 'ONLINE', '정상', '정치서', '팀A', 'profile1.png', 'user00@example.com', 'password', '010-1234-5678', '2023-10-01 10:00:00'),
    (UUID(), 'USER', 'ONLINE', '정상', '백배승', '팀B', 'profile2.png', 'user01@example.com', 'password', '010-2345-6789', '2023-10-01 11:00:00'),
    (UUID(), 'USER', 'ONLINE', '정상', '김두식', '팀A', 'profile1.png', 'user2@example.com', 'password', '010-1234-5678', '2023-10-01 10:00:00'),
    (UUID(), 'USER', 'ONLINE', '정상', '나작업', '팀A', 'profile1.png', 'user3@example.com', 'password', '010-1234-5678', '2023-10-01 10:00:00');
      INSERT INTO User (user_id, role, onOffState, state, name, team_name, profile_pic, email, pw, phone_number, last_login)
VALUES
    (UUID(), 'USER', 'ONLINE', '정상', 'field01', '팀B', 'profile1.png', 'field01', 'password', '010-2345-6789', '2023-10-01 11:00:00'),
    (UUID(), 'USER', 'ONLINE', '정상', 'field02', '팀A', 'profile1.png', 'field02', 'password', '010-1234-5678', '2023-10-01 10:00:00'),
    (UUID(), 'USER', 'ONLINE', '정상', 'field03', '팀A', 'profile1.png', 'field03', 'password', '010-1234-5678', '2023-10-01 10:00:00');
   
-- ChattingRoom 더미 데이터 삽입
INSERT INTO ChattingRoom (chatting_room_id, participants, chatroom_type, recent_message, create_at, update_at)
VALUES
    (UUID(), 'user1, user2', '1:1', '최근 메시지 내용', '2023-10-01 10:00:00', '2023-10-01 11:00:00');

-- Relationship 더미 데이터 삽입
INSERT INTO Relationship (user_id, chatting_room_id)
VALUES
    ((SELECT user_id FROM User WHERE email = 'admin01@example.com'), (SELECT chatting_room_id FROM ChattingRoom LIMIT 1)),
    ((SELECT user_id FROM User WHERE email = 'user01@example.com'), (SELECT chatting_room_id FROM ChattingRoom LIMIT 1));
   
-- WorkingArea 더미 데이터 삽입
INSERT INTO WorkingArea (area_id, area_name)
VALUES
    (UUID(), 'Main Area');
   
   -- Section 더미 데이터 삽입
   
INSERT INTO Section (section_id, area_id, section, section_Info, image)
values
	(UUID(), (SELECT area_id FROM WorkingArea LIMIT 1), 'CHEMICAL', 'CHEMICAL 정보', 'CHEMICAL.png'),
   	(UUID(), (SELECT area_id FROM WorkingArea LIMIT 1), '회수시설', '회수시설 정보', '회수시설.png'),
  	(UUID(), (SELECT area_id FROM WorkingArea LIMIT 1), 'AC1831', 'AC1831 정보', 'AC1831.png'),
 	(UUID(), (SELECT area_id FROM WorkingArea LIMIT 1), '태광 C3 loading', '태광 C3 loading 정보', '태광_C3_loading.png'),
	(UUID(), (SELECT area_id FROM WorkingArea LIMIT 1), 'SKA/효성 #2 C3 loading', 'SKA/효성 #2 C3 loading 정보', 'SKA/효성_#2_C3_loading.png'),
	(UUID(), (SELECT area_id FROM WorkingArea LIMIT 1), '효성 #1 C3 loading', '효성 #1 C3 loading 정보', '효성_#1_C3_loading.png'),
	(UUID(), (SELECT area_id FROM WorkingArea LIMIT 1), 'SKE C3 unloading', 'SKE C3 unloading 정보', 'SKE_C3_unloading.png'),
	(UUID(), (SELECT area_id FROM WorkingArea LIMIT 1), 'SKGC C4 loading', 'SKGC C4 loading 정보', 'SKGC_C4_loading.png'),
	(UUID(), (SELECT area_id FROM WorkingArea LIMIT 1), '카프로 C3 loading', '카프로 C3 loading 정보', '카프로_C3_loading.png'),
	(UUID(), (SELECT area_id FROM WorkingArea LIMIT 1), 'UAC C3 loading', 'UAC C3 loading 정보', 'UAC_C3_loading.png'),
	(UUID(), (SELECT area_id FROM WorkingArea LIMIT 1), '석화사 출하펌프', '석화사 출하펌프 정보', '석화사_출하펌프.png'),
	(UUID(), (SELECT area_id FROM WorkingArea LIMIT 1), 'SKE H2 C3', 'SKE H2 C3 정보', 'SKE_H2_C3.png'),
	(UUID(), (SELECT area_id FROM WorkingArea LIMIT 1), '기타', '기타 정보', '기타.png');

-- SubSection 더미 데이터 삽입
-- 삽입된 Section들의 id를 사용하여 SubSection 테이블에 여러 행 삽입
delete from SubSection;
INSERT INTO SubSection (subSection_id, section_id, subSection_name, item_no, section_unit, item_pic)
values
   	(UUID(), (SELECT section_id FROM Section WHERE section = 'CHEMICAL' LIMIT 1), 'P-701 A Dis', 'PI-701', 'kg/㎠', 'pi701.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'CHEMICAL' LIMIT 1), 'P-701 B Dis', 'PI-702', 'kg/㎠', 'pi702.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'CHEMICAL' LIMIT 1), 'P-701 C Dis', 'PI-703', 'kg/㎠', 'pi703.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'CHEMICAL' LIMIT 1), 'P-701 D Dis', 'PI-704', 'kg/㎠', 'pi704.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'CHEMICAL' LIMIT 1), 'P-701 A Suction', 'PI-705', 'kg/㎠', 'pi705.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'CHEMICAL' LIMIT 1), 'P-701 B Suction', 'PI-706', 'kg/㎠', 'pi706.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'CHEMICAL' LIMIT 1), 'P-701 C Suction', 'PI-707', 'kg/㎠', 'pi707.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'CHEMICAL' LIMIT 1), 'P-701 D Suction', 'PI-708', 'kg/㎠', 'pi708.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'CHEMICAL' LIMIT 1), 'P-701 A Temp', 'TI-701', '℃', 'ti701.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'CHEMICAL' LIMIT 1), 'P-701 B Temp', 'TI-702', '℃', 'ti702.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'CHEMICAL' LIMIT 1), 'P-701 C Temp', 'TI-703', '℃', 'ti703.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'CHEMICAL' LIMIT 1), 'P-701 D Temp', 'TI-704', '℃', 'ti704.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '회수시설' LIMIT 1), 'P-771', 'PG-771/LG-771', 'kg/㎠ / cm', 'p771.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '회수시설' LIMIT 1), 'P-772', 'PG-772/LG-772', 'kg/㎠ / cm', 'p772.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'AC1831' LIMIT 1), 'Discharge Press', 'PI-831', 'kg/㎠', 'pi831.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'AC1831' LIMIT 1), 'Motor Water Temp', 'TI-831', '℃', 'ti831.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'AC1831' LIMIT 1), 'Receive TK', 'PI-832', 'kg/㎠', 'pi832.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'AC1831' LIMIT 1), 'Air flow', 'FI-833', '㎥/min', 'fi833.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'AC1831' LIMIT 1), 'Seperator Temp', 'TI-834', '℃', 'ti834.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '태광 C3 loading' LIMIT 1), 'Loading Temp', 'TI-767', '℃', 'ti767.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '태광 C3 loading' LIMIT 1), 'Suction Press', 'PI-767', 'kg/㎠', 'pi767.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '태광 C3 loading' LIMIT 1), 'Different Press', 'PDI-767', 'kg/㎠', 'pdi767.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '태광 C3 loading' LIMIT 1), 'SUM FO', 'FI-767', '㎥', 'fi767.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'SKA/효성 #2 C3 loading' LIMIT 1), 'Loading Temp', 'TI-768', '℃', 'ti768.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'SKA/효성 #2 C3 loading' LIMIT 1), 'Suction Press', 'PI-768', 'kg/㎠', 'pi768.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'SKA/효성 #2 C3 loading' LIMIT 1), 'Different Press', 'PDI-768', 'kg/㎠', 'pdi768.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'SKA/효성 #2 C3 loading' LIMIT 1), 'SUM FO', 'FI-768', '㎥', 'fi768.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '효성 #1 C3 loading' LIMIT 1), 'Loading Temp', 'TI-769', '℃', 'ti769.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '효성 #1 C3 loading' LIMIT 1), 'Suction Press', 'PI-769', 'kg/㎠', 'pi769.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '효성 #1 C3 loading' LIMIT 1), 'Different Press', 'PDI-769', 'kg/㎠', 'pdi769.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '효성 #1 C3 loading' LIMIT 1), 'SUM FO', 'FI-769', '㎥', 'fi769.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'SKE C3 unloading' LIMIT 1), 'Loading Temp', 'TI-770', '℃', 'ti770.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'SKE C3 unloading' LIMIT 1), 'Suction Press', 'PI-770', 'kg/㎠', 'pi770.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'SKE C3 unloading' LIMIT 1), 'Different Press', 'PDI-770', 'kg/㎠', 'pdi770.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'SKE C3 unloading' LIMIT 1), 'SUM FO', 'FI-770', '㎥', 'fi770.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'SKGC C4 loading' LIMIT 1), 'Loading Temp', 'TI-771', '℃', 'ti771.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'SKGC C4 loading' LIMIT 1), 'Suction Press', 'PI-771', 'kg/㎠', 'pi771.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'SKGC C4 loading' LIMIT 1), 'Different Press', 'PDI-771', 'kg/㎠', 'pdi771.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'SKGC C4 loading' LIMIT 1), 'SUM FO', 'FI-771', '㎥', 'fi771.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '카프로 C3 loading' LIMIT 1), 'Loading Temp', 'TI-772', '℃', 'ti772.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '카프로 C3 loading' LIMIT 1), 'Suction Press', 'PI-772', 'kg/㎠', 'pi772.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '카프로 C3 loading' LIMIT 1), 'Different Press', 'PDI-772', 'kg/㎠', 'pdi772.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '카프로 C3 loading' LIMIT 1), 'SUM FO', 'FI-772', '㎥', 'fi772.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'UAC C3 loading' LIMIT 1), 'Loading Temp', 'TI-773', '℃', 'ti773.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'UAC C3 loading' LIMIT 1), 'Suction Press', 'PI-773', 'kg/㎠', 'pi773.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'UAC C3 loading' LIMIT 1), 'Different Press', 'PDI-773', 'kg/㎠', 'pdi773.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'UAC C3 loading' LIMIT 1), 'SUM FO', 'FI-773', '㎥', 'fi773.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '석화사 출하펌프' LIMIT 1), 'Loading Temp', 'TI-774', '℃', 'ti774.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '석화사 출하펌프' LIMIT 1), 'Suction Press', 'PI-774', 'kg/㎠', 'pi774.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '석화사 출하펌프' LIMIT 1), 'Different Press', 'PDI-774', 'kg/㎠', 'pdi774.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '석화사 출하펌프' LIMIT 1), 'SUM FO', 'FI-774', '㎥', 'fi774.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'SKE H2 C3' LIMIT 1), 'Loading Temp', 'TI-775', '℃', 'ti775.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'SKE H2 C3' LIMIT 1), 'Suction Press', 'PI-775', 'kg/㎠', 'pi775.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'SKE H2 C3' LIMIT 1), 'Different Press', 'PDI-775', 'kg/㎠', 'pdi775.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = 'SKE H2 C3' LIMIT 1), 'SUM FO', 'FI-775', '㎥', 'fi775.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '기타' LIMIT 1), 'Loading Temp', 'TI-776', '℃', 'ti776.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '기타' LIMIT 1), 'Suction Press', 'PI-776', 'kg/㎠', 'pi776.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '기타' LIMIT 1), 'Different Press', 'PDI-776', 'kg/㎠', 'pdi776.png'),
    (UUID(), (SELECT section_id FROM Section WHERE section = '기타' LIMIT 1), 'SUM FO', 'FI-776', '㎥', 'fi776.png');


   -- schedule 더미 데이터 삽입
-- INSERT INTO schedule (schedule_id, area_name, section, schedule_type, time, create_at, user_id)
-- VALUES
--     (UUID(), 'C3/C4 & 부두 Area', 'CHEMICAL', 'm', '08:00', '2023-10-01 08:00:00', (SELECT user_id FROM User WHERE email = 'admin@example.com')),
--     (UUID(), 'Main Area', '회수시설', 's', '12:00', '2023-10-02 12:00:00', (SELECT user_id FROM User WHERE email = 'user1@example.com')),
--     (UUID(), 'Fuel Cell Area', '대분류', 'n', '16:00', '2023-10-03 16:00:00', (SELECT user_id FROM User WHERE email = 'admin@example.com'));
   DELETE FROM schedule;
-- 
-- -- 오늘 날짜로 된 더미 데이터 삽입
-- INSERT INTO schedule (schedule_id, area_name, section, schedule_type, time, create_at, user_id)
-- VALUES
--     (UUID(), 'Main Area', 'Section K', 'm', '08:00', NOW(), (SELECT user_id FROM User WHERE email = 'user2@example.com')),
--     (UUID(), 'Main Area', 'Section L', 's', '12:00', NOW(), (SELECT user_id FROM User WHERE email = 'user2@example.com')),
--     (UUID(), 'Main Area', 'Section M', 'n', '16:00', NOW(), (SELECT user_id FROM User WHERE email = 'user2@example.com')),
--     (UUID(), 'Main Area', 'Section N', 'm', '08:00', NOW(), (SELECT user_id FROM User WHERE email = 'user2@example.com')),
--     (UUID(), 'Main Area', 'Section O', 's', '12:00', NOW(), (SELECT user_id FROM User WHERE email = 'user2@example.com'));
--    
-- INSERT INTO schedule (schedule_id, area_name, section, schedule_type, time, create_at, user_id)
-- VALUES
--     (UUID(), 'Main Area', 'Section K', 'm', '08:00', DATE_SUB(NOW(), INTERVAL 1 DAY), (SELECT user_id FROM User WHERE email = 'user2@example.com'));
--    INSERT INTO schedule (schedule_id, area_name, section, schedule_type, time, create_at, user_id)
-- values
--     (UUID(), 'Main Area', 'Section L', 's', '12:00', DATE_SUB(NOW(), INTERVAL 1 DAY), (SELECT user_id FROM User WHERE email = 'user2@example.com'));
--    INSERT INTO schedule (schedule_id, area_name, section, schedule_type, time, create_at, user_id)
-- VALUES
--     (UUID(), 'Main Area', 'Section M', 'n', '16:00', DATE_SUB(NOW(), INTERVAL 1 DAY), (SELECT user_id FROM User WHERE email = 'user2@example.com'));
--    INSERT INTO schedule (schedule_id, area_name, section, schedule_type, time, create_at, user_id)
-- VALUES
--     (UUID(), 'Main Area', 'Section N', 'm', '08:00', DATE_SUB(NOW(), INTERVAL 1 DAY), (SELECT user_id FROM User WHERE email = 'user2@example.com'));
--    INSERT INTO schedule (schedule_id, area_name, section, schedule_type, time, create_at, user_id)
-- VALUES
--     (UUID(), 'Main Area', 'Section O', 's', '12:00', DATE_SUB(NOW(), INTERVAL 1 DAY), (SELECT user_id FROM User WHERE email = 'user2@example.com'));
--    
-- 오늘 날짜로 된 더미 데이터 삽입
INSERT INTO schedule (schedule_id, area_name, section, schedule_type, time, create_at, user_id, foreman, worker)
VALUES
    (UUID(), 'Main Area', 'All', 'm', '08:00', NOW(), (SELECT user_id FROM User WHERE email = 'user00@example.com'), (SELECT user_id FROM User WHERE email = 'user00@example.com'), (SELECT user_id FROM User WHERE email = 'user01@example.com')),
	(UUID(), 'Main Area', 'All', 'm', '08:00', NOW(), (SELECT user_id FROM User WHERE email = 'user01@example.com'), (SELECT user_id FROM User WHERE email = 'user00@example.com'), (SELECT user_id FROM User WHERE email = 'user01@example.com')),
	(UUID(), 'Main Area', 'All', 'm', '12:00', NOW(), (SELECT user_id FROM User WHERE email = 'user00@example.com'), (SELECT user_id FROM User WHERE email = 'user00@example.com'), (SELECT user_id FROM User WHERE email = 'user01@example.com')),
	(UUID(), 'Main Area', 'All', 'm', '12:00', NOW(), (SELECT user_id FROM User WHERE email = 'user01@example.com'), (SELECT user_id FROM User WHERE email = 'user00@example.com'), (SELECT user_id FROM User WHERE email = 'user01@example.com')),
   	(UUID(), 'Main Area', 'All', 's', '16:00', NOW(), (SELECT user_id FROM User WHERE email = 'user2@example.com'), (SELECT user_id FROM User WHERE email = 'user2@example.com'), (SELECT user_id FROM User WHERE email = 'user3@example.com')),
    (UUID(), 'Main Area', 'All', 's', '16:00', NOW(), (SELECT user_id FROM User WHERE email = 'user3@example.com'), (SELECT user_id FROM User WHERE email = 'user2@example.com'), (SELECT user_id FROM User WHERE email = 'user3@example.com')),
    (UUID(), 'Main Area', 'All', 's', '20:00', NOW(), (SELECT user_id FROM User WHERE email = 'user2@example.com'), (SELECT user_id FROM User WHERE email = 'user2@example.com'), (SELECT user_id FROM User WHERE email = 'user3@example.com')),
    (UUID(), 'Main Area', 'All', 's', '20:00', NOW(), (SELECT user_id FROM User WHERE email = 'user3@example.com'), (SELECT user_id FROM User WHERE email = 'user2@example.com'), (SELECT user_id FROM User WHERE email = 'user3@example.com')),
	(UUID(), 'Main Area', 'All', 'n', '00:00', NOW(), (SELECT user_id FROM User WHERE email = 'user2@example.com'), (SELECT user_id FROM User WHERE email = 'user2@example.com'), (SELECT user_id FROM User WHERE email = 'user3@example.com')),
    (UUID(), 'Main Area', 'All', 'n', '00:00', NOW(), (SELECT user_id FROM User WHERE email = 'user3@example.com'), (SELECT user_id FROM User WHERE email = 'user2@example.com'), (SELECT user_id FROM User WHERE email = 'user3@example.com')),
    (UUID(), 'Main Area', 'All', 'n', '04:00', NOW(), (SELECT user_id FROM User WHERE email = 'user2@example.com'), (SELECT user_id FROM User WHERE email = 'user2@example.com'), (SELECT user_id FROM User WHERE email = 'user3@example.com')),
    (UUID(), 'Main Area', 'All', 'n', '04:00', NOW(), (SELECT user_id FROM User WHERE email = 'user3@example.com'), (SELECT user_id FROM User WHERE email = 'user2@example.com'), (SELECT user_id FROM User WHERE email = 'user3@example.com'));
   INSERT INTO schedule (schedule_id, area_name, section, schedule_type, time, create_at, user_id, foreman, worker)
values
	(UUID(), 'Main Area', 'All', 'n', '02:00', NOW(), (SELECT user_id FROM User WHERE email = 'user2@example.com'), (SELECT user_id FROM User WHERE email = 'user2@example.com'), (SELECT user_id FROM User WHERE email = 'user3@example.com')),
    (UUID(), 'Main Area', 'All', 'n', '02:00', NOW(), (SELECT user_id FROM User WHERE email = 'user3@example.com'), (SELECT user_id FROM User WHERE email = 'user2@example.com'), (SELECT user_id FROM User WHERE email = 'user3@example.com')),
    (UUID(), 'Main Area', 'All', 'n', '06:00', NOW(), (SELECT user_id FROM User WHERE email = 'user2@example.com'), (SELECT user_id FROM User WHERE email = 'user2@example.com'), (SELECT user_id FROM User WHERE email = 'user3@example.com')),
    (UUID(), 'Main Area', 'All', 'n', '06:00', NOW(), (SELECT user_id FROM User WHERE email = 'user3@example.com'), (SELECT user_id FROM User WHERE email = 'user2@example.com'), (SELECT user_id FROM User WHERE email = 'user3@example.com'));
   
    INSERT INTO schedule (schedule_id, area_name, section, schedule_type, time, create_at, user_id, foreman, worker)
values
	(UUID(), 'Main Area', 'All', 'n', '02:00', NOW(), (SELECT user_id FROM User WHERE email = 'field01'), (SELECT user_id FROM User WHERE email = 'field02'), (SELECT user_id FROM User WHERE email = 'field01'));
    

-- 어제 날짜로 된 더미 데이터 삽입
INSERT INTO schedule (schedule_id, area_name, section, schedule_type, time, create_at, user_id, foreman, worker)
VALUES
    (UUID(), 'Main Area', 'All', 'm', '08:00', DATE_SUB(NOW(), INTERVAL 1 DAY), 
        (SELECT user_id FROM User WHERE email = 'user00@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user00@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user01@example.com')),
    (UUID(), 'Main Area', 'All', 'm', '08:00', DATE_SUB(NOW(), INTERVAL 1 DAY), 
        (SELECT user_id FROM User WHERE email = 'user01@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user00@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user01@example.com')),
    (UUID(), 'Main Area', 'All', 'm', '12:00', DATE_SUB(NOW(), INTERVAL 1 DAY), 
        (SELECT user_id FROM User WHERE email = 'user00@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user00@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user01@example.com')),
    (UUID(), 'Main Area', 'All', 'm', '12:00', DATE_SUB(NOW(), INTERVAL 1 DAY), 
        (SELECT user_id FROM User WHERE email = 'user01@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user00@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user01@example.com')),
    (UUID(), 'Main Area', 'All', 's', '16:00', DATE_SUB(NOW(), INTERVAL 1 DAY), 
        (SELECT user_id FROM User WHERE email = 'user2@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user2@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user3@example.com')),
    (UUID(), 'Main Area', 'All', 's', '16:00', DATE_SUB(NOW(), INTERVAL 1 DAY), 
        (SELECT user_id FROM User WHERE email = 'user3@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user2@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user3@example.com')),
    (UUID(), 'Main Area', 'All', 's', '20:00', DATE_SUB(NOW(), INTERVAL 1 DAY), 
        (SELECT user_id FROM User WHERE email = 'user2@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user2@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user3@example.com')),
    (UUID(), 'Main Area', 'All', 's', '20:00', DATE_SUB(NOW(), INTERVAL 1 DAY), 
        (SELECT user_id FROM User WHERE email = 'user3@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user2@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user3@example.com')),
    (UUID(), 'Main Area', 'All', 'n', '00:00', DATE_SUB(NOW(), INTERVAL 1 DAY), 
        (SELECT user_id FROM User WHERE email = 'user2@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user2@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user3@example.com')),
    (UUID(), 'Main Area', 'All', 'n', '00:00', DATE_SUB(NOW(), INTERVAL 1 DAY), 
        (SELECT user_id FROM User WHERE email = 'user3@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user2@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user3@example.com')),
    (UUID(), 'Main Area', 'All', 'n', '04:00', DATE_SUB(NOW(), INTERVAL 1 DAY), 
        (SELECT user_id FROM User WHERE email = 'user2@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user2@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user3@example.com')),
    (UUID(), 'Main Area', 'All', 'n', '04:00', DATE_SUB(NOW(), INTERVAL 1 DAY), 
        (SELECT user_id FROM User WHERE email = 'user3@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user2@example.com'), 
        (SELECT user_id FROM User WHERE email = 'user3@example.com'));
-- Notice 더미 데이터 삽입
   delete from notice;
INSERT INTO Notice (notice_id, user_id, content, create_at, updated_at, importance)
VALUES
    (UUID(), (SELECT user_id FROM User WHERE email = 'admin@example.com'), '공지사항 내용', '2023-10-01 10:00:00', '2023-10-01 11:00:00', 'HIGH'),
    (UUID(), (SELECT user_id FROM User WHERE email = 'admin2@example.com'), '공지사항 내용 2', '2023-10-02 09:00:00', '2023-10-02 10:00:00', 'LOW'),
    (UUID(), (SELECT user_id FROM User WHERE email = 'admin3@example.com'), '공지사항 내용 3', '2023-10-03 08:00:00', '2023-10-03 09:00:00', 'HIGH'),
    (UUID(), (SELECT user_id FROM User WHERE email = 'admin4@example.com'), '공지사항 내용 4', '2023-10-04 07:00:00', '2023-10-04 08:00:00', 'LOW'),
    (UUID(), (SELECT user_id FROM User WHERE email = 'admin5@example.com'), '공지사항 내용 5', '2023-10-05 06:00:00', '2023-10-05 07:00:00', 'HIGH'),
    (UUID(), (SELECT user_id FROM User WHERE email = 'admin6@example.com'), '공지사항 내용 6', '2023-10-06 05:00:00', '2023-10-06 06:00:00', 'LOW'),
    (UUID(), (SELECT user_id FROM User WHERE email = 'admin7@example.com'), '공지사항 내용 7', '2023-10-05 09:00:00', '2023-10-07 07:00:00', 'HIGH'),
    (UUID(), (SELECT user_id FROM User WHERE email = 'admin8@example.com'), '공지사항 내용 8', '2023-10-06 10:00:00', '2023-10-08 06:00:00', 'LOW');
   
   



-- WorkingTime 더미 데이터 삽입
INSERT INTO WorkingTime (work_time_id, area_id, schedule_type, time)
VALUES
    (UUID(), (SELECT area_id FROM WorkingArea WHERE area_name = 'Main Area' LIMIT 1), 'm', '08:00'),
    (UUID(), (SELECT area_id FROM WorkingArea WHERE area_name = 'Main Area' LIMIT 1), 'm', '12:00'),
    (UUID(), (SELECT area_id FROM WorkingArea WHERE area_name = 'Main Area' LIMIT 1), 's', '16:00'),
    (UUID(), (SELECT area_id FROM WorkingArea WHERE area_name = 'Main Area' LIMIT 1), 's', '20:00'),
    (UUID(), (SELECT area_id FROM WorkingArea WHERE area_name = 'Main Area' LIMIT 1), 'n', '00:00'),
    (UUID(), (SELECT area_id FROM WorkingArea WHERE area_name = 'Main Area' LIMIT 1), 'n', '04:00');
   INSERT INTO WorkingTime (work_time_id, area_id, schedule_type, time)
values
    (UUID(), (SELECT area_id FROM WorkingArea WHERE area_name = 'Main Area' LIMIT 1), 'n', '02:00'),
    (UUID(), (SELECT area_id FROM WorkingArea WHERE area_name = 'Main Area' LIMIT 1), 'n', '06:00');

-- WorkingDetail 더미 데이터 삽입
INSERT INTO WorkingDetail (working_detail_id, work_time_id, value, create_at)
VALUES
    (UUID(), (SELECT area_id FROM WorkingArea WHERE area_name = 'Main Area' LIMIT 1), 'm', '08:00'),
    (UUID(), (SELECT area_id FROM WorkingArea WHERE area_name = 'Main Area' LIMIT 1), 's', '12:00'),
    (UUID(), (SELECT area_id FROM WorkingArea WHERE area_name = 'Main Area' LIMIT 1), 'n', '16:00');

-- Chat 더미 데이터 삽입
INSERT INTO Chat (message_id, chatting_room_id, user_id, message_type, content, time_stamp, read_status, attachment)
VALUES
    (UUID(), (SELECT chatting_room_id FROM ChattingRoom LIMIT 1), (SELECT user_id FROM User WHERE email = 'admin@example.com'), 'TEXT', '메시지 내용', '2023-10-01 10:00:00', TRUE, 'attachment1.png');
);