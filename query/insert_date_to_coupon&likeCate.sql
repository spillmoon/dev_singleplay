// coupon 테이블 insert문
insert into coupon(couponName, saveOff, user_id, periodStart, periodEnd)
values('누적 다운로드 10만 돌파기념 쿠폰', 10, 1, '2016-09-01', '2016-09-30');
insert into coupon(couponName, saveOff, user_id, periodStart, periodEnd)
values('추석맞이 할인 정기 쿠폰', 15, 1, '2016-09-12', '2016-09-18');
insert into coupon(couponName, saveOff, user_id, periodStart, periodEnd)
values('카톡 플친맺기 이벤트 쿠폰', 8, 1, '2016-09-09', '2016-09-13');


// likeCate 테이블 insert문
insert into likeCate(cateId,typeId, typeNo, typeName)
values(1, 0, 0, '뮤지컬');
insert into likeCate(cateId,typeId, typeNo, typeName)
values(2, 0, 1, '오페라');
insert into likeCate(cateId,typeId, typeNo, typeName)
values(3, 0, 2, '콘서트');
insert into likeCate(cateId,typeId, typeNo, typeName)
values(4, 1, 0, '월');
insert into likeCate(cateId,typeId, typeNo, typeName)
values(5, 1, 1, '화');
insert into likeCate(cateId,typeId, typeNo, typeName)
values(6, 1, 2, '수');
insert into likeCate(cateId,typeId, typeNo, typeName)
values(7, 1, 3, '목');
insert into likeCate(cateId,typeId, typeNo, typeName)
values(8, 1, 4, '금');
insert into likeCate(cateId,typeId, typeNo, typeName)
values(9, 1, 5, '토');
insert into likeCate(cateId,typeId, typeNo, typeName)
values(10, 1, 6, '일');