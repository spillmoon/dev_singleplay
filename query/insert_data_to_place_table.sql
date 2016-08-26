insert into place(placeName, address)
values('디큐브 아트센터', '서울시 종로구');
insert into place(placeName, address)
values('대명문화공장 1관 비발디파크홀', '서울시 종로구');
insert into place(placeName, address)
values('충무아트센터 대극장', '서울시 중구');
insert into place(placeName, address)
values('LG아트센터', '서울시 강남구');
insert into place(placeName, address)
values('세종문화회관 대극장', '서울시 종로구');
insert into place(placeName, address)
values('대전무역전시관', '대전시 유성구');
insert into place(placeName, address)
values('인천 삼산 월드 체육관', '인천시 부평구');
insert into place(placeName, address)
values('엑스코 컨벤션홀', '대구시 북구');
insert into place(placeName, address)
values('블루스퀘어 삼성카드홀', '서울시 용산구');


select *
from play
where theme = '뮤지컬' and playDay = str_to_date('2016-08-30', '%Y-%m-%d');

select *
from play
where id = 19;
