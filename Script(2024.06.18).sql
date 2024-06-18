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
    FOREIGN KEY (section_id) REFERENCES Section(section_id)
);

-- WorkingTime 테이블 생성
CREATE TABLE WorkingTime (
    work_time_id UUID PRIMARY KEY,
    section_id UUID,
    schedule_type VARCHAR(255),
    time DATETIME,
    FOREIGN KEY (section_id) REFERENCES Section(section_id)
);

-- WorkingDetail 테이블 생성
CREATE TABLE WorkingDetail (
    working_detail_id UUID PRIMARY KEY,
    work_time_id UUID,
    value VARCHAR(255),
    create_at DATETIME,
    FOREIGN KEY (work_time_id) REFERENCES WorkingTime(work_time_id)
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
    
    -- User 더미 데이터 삽입
INSERT INTO User (user_id, role, onOffState, state, name, team_name, profile_pic, email, pw, phone_number, last_login)
VALUES
    (UUID(), 'ADMIN', 'ONLINE', '정상', '관리자', '팀A', 'profile1.png', 'admin@example.com', 'password', '010-1234-5678', '2023-10-01 10:00:00'),
    (UUID(), 'USER', 'OFFLINE', '정지', '사용자1', '팀B', 'profile2.png', 'user1@example.com', 'password', '010-2345-6789', '2023-10-01 11:00:00');

-- ChattingRoom 더미 데이터 삽입
INSERT INTO ChattingRoom (chatting_room_id, participants, chatroom_type, recent_message, create_at, update_at)
VALUES
    (UUID(), 'user1, user2', '1:1', '최근 메시지 내용', '2023-10-01 10:00:00', '2023-10-01 11:00:00');

-- Relationship 더미 데이터 삽입
INSERT INTO Relationship (user_id, chatting_room_id)
VALUES
    ((SELECT user_id FROM User WHERE email = 'admin@example.com'), (SELECT chatting_room_id FROM ChattingRoom LIMIT 1)),
    ((SELECT user_id FROM User WHERE email = 'user1@example.com'), (SELECT chatting_room_id FROM ChattingRoom LIMIT 1));

-- Notice 더미 데이터 삽입
INSERT INTO Notice (notice_id, user_id, content, create_at, updated_at, importance)
VALUES
    (UUID(), (SELECT user_id FROM User WHERE email = 'admin@example.com'), '공지사항 내용', '2023-10-01 10:00:00', '2023-10-01 11:00:00', 'HIGH');

-- WorkingArea 더미 데이터 삽입
INSERT INTO WorkingArea (area_id, area_name)
VALUES
    (UUID(), 'Main Area');

-- Section 더미 데이터 삽입
INSERT INTO Section (section_id, area_id, section, section_Info, image)
VALUES
    (UUID(), (SELECT area_id FROM WorkingArea LIMIT 1), 'CHEMICAL', 'CHEMICAL 정보', 'image1.png');

-- SubSection 더미 데이터 삽입
INSERT INTO SubSection (subSection_id, section_id, subSection_name, item_no, section_unit)
VALUES
    (UUID(), (SELECT section_id FROM Section LIMIT 1), 'P-701', 'item1', 'unit1');

-- WorkingTime 더미 데이터 삽입
INSERT INTO WorkingTime (work_time_id, section_id, schedule_type, time)
VALUES
    (UUID(), (SELECT section_id FROM Section LIMIT 1), '8:00', '2023-10-01 08:00:00');

-- WorkingDetail 더미 데이터 삽입
INSERT INTO WorkingDetail (working_detail_id, work_time_id, value, create_at)
VALUES
    (UUID(), (SELECT work_time_id FROM WorkingTime LIMIT 1), 'value1', '2023-10-01 08:00:00');

-- Chat 더미 데이터 삽입
INSERT INTO Chat (message_id, chatting_room_id, user_id, message_type, content, time_stamp, read_status, attachment)
VALUES
    (UUID(), (SELECT chatting_room_id FROM ChattingRoom LIMIT 1), (SELECT user_id FROM User WHERE email = 'admin@example.com'), 'TEXT', '메시지 내용', '2023-10-01 10:00:00', TRUE, 'attachment1.png');
);