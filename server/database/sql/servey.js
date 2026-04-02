// 설문 구조를 item -> sub_item -> detail 순서로 펼쳐서 가져오는 조회문.
// left join을 쓰는 이유는 아직 하위 항목이 비어 있는 draft 설문도 보여줘야 하기 때문이다.
// inner join이면 detail이 없는 중간 저장 상태가 통째로 누락될 수 있다.
const selectSurvey = `
select
    v.version_id as version_id,
    i.item_id as item_id,
    i.item_name as item_name,
    i.display_order as item_display_order,
    s.sub_item_id as sub_item_id,
    s.sub_item_name as sub_item_name,
    s.display_order as sub_item_display_order,
    d.detail_id as detail_id,
    d.question_text as question_text,
    d.display_order as detail_display_order
from survey_version v
left join survey_item i
    on v.version_id = i.version_id
left join survey_sub_item s
    on i.item_id = s.item_id
left join survey_detail d
    on s.sub_item_id = d.sub_item_id
where v.version_id = ?
order by i.display_order, s.display_order, d.display_order;
`;

const insert_item = `
insert into survey_item (item_name, version_id, display_order)
select
    ?,
    ?,
    ifnull(max(display_order), 0) + 1
from survey_item
where version_id = ?;
`;

const insert_subitem = `
insert into survey_sub_item (sub_item_name, item_id, display_order)
select
    ?,
    ?,
    ifnull(max(display_order), 0) + 1
from survey_sub_item
where item_id = ?;
`;

const insert_detail = `
insert into survey_detail (question_text, sub_item_id, display_order)
select
    ?,
    ?,
    ifnull(max(display_order), 0) + 1
from survey_detail
where sub_item_id = ?;
`;

const selectVersionList = `
select
    version_id as version_id,
    is_active as is_active,
    date_format(create_date, '%Y-%m-%d') as create_date
from survey_version
order by version_id desc;
`;

const deactivateVersions = `
update survey_version
set is_active = 0
where is_active = 1;
`;

const setActiveVersion = `
update survey_version
set is_active = 1
where version_id = ?;
`;

const insertNewDraftVersion = `
insert into survey_version (is_active, create_date)
values (0, now());
`;

const memberSurvey = `
select
    version_id as version_id
from survey_version
where is_active = 1;
`;

const insert_application = `
insert into application (version_id, bene_id, user_name, created_at)
values (?, ?, ?, now());
`;

// 답변은 mapper에서 conn.batch()로 한 번에 밀어 넣는다.
// SQL은 단순 insert 형태로 두고, 파라미터 묶음을 여러 벌 넘겨 벌크 처리한다.
const insert_survey_answer = `
insert into survey_answer (answer_value, detail_id, app_id)
values (?, ?, ?);
`;

const select_application_by_id = `
select
    app_id as app_id,
    version_id as version_id,
    bene_id as bene_id,
    user_name as user_name,
    app_status as app_status,
    date_format(created_at, '%Y-%m-%d') as created_at
from application
where app_id = ?;
`;

const select_answers_by_app_id = `
select
    detail_id as detail_id,
    answer_value as answer_value
from survey_answer
where app_id = ?;
`;

// 신청서 목록에서 priority를 join 하는 이유는 "신청 자체 정보"와
// "현재 최신 대기단계 상태"를 한 번에 내려 member / manager / admin 화면이 같이 쓰게 하기 위해서다.
// max(priority_id)를 쓰는 이유는 priority 테이블이 최신 상태 update형이 아니라 이력 누적형이기 때문이다.
const select_application_list_by_bene = `
select
    a.app_id as id,
    a.user_name as writer,
    b.bene_name as bene_name,
    date_format(a.created_at, '%Y.%m.%d') as date,
    p.priority_status as priority_status,
    p.progress_status as progress_status,
    a.app_status as app_status
from application a
left join beneficiary_info b
    on a.bene_id = b.bene_id
left join priority p
    on p.priority_id = (
        select max(priority_id)
        from priority
        where bene_id = a.bene_id
    )
where a.bene_id = ?
order by a.created_at desc;
`;

const delete_survey_answers = `
delete from survey_answer
where app_id = ?;
`;

const delete_application = `
delete from application
where app_id = ?;
`;

const check_active_application = `
select
    count(*) as cnt
from application
where bene_id = ?
  and app_status in ('대기', '진행중', '진행 중');
`;

const select_application_status = `
select
    app_status as app_status
from application
where app_id = ?;
`;

const update_applications_to_inprogress_by_bene = `
update application
set app_status = '진행중'
where bene_id = ?
  and app_status = '대기';
`;

module.exports = {
  selectSurvey,
  insert_item,
  insert_subitem,
  insert_detail,
  selectVersionList,
  deactivateVersions,
  setActiveVersion,
  insertNewDraftVersion,
  memberSurvey,
  insert_application,
  insert_survey_answer,
  select_application_by_id,
  select_answers_by_app_id,
  select_application_list_by_bene,
  delete_survey_answers,
  delete_application,
  check_active_application,
  select_application_status,
  update_applications_to_inprogress_by_bene,
};
