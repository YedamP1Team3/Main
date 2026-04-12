const BeneList = `
select
    bene_id,
    bene_name
from beneficiary_info
order by bene_name asc;
`;

// beneficiary_info 하나만 보면 가족, 담당자 이름을 알 수 없다.
// 그래서 user_info를 두 번 join 해서 보호자 이름과 담당자 이름을 같이 붙인다.
// priority도 최신 상태 한 줄만 붙여 상세 화면이 바로 현재 단계를 표시할 수 있게 한다.
const BeneById = `
select
    b.bene_id as bene_id,
    b.bene_name as bene_name,
    u1.user_name as family_name,
    u2.user_name as manager_name,
    b.gender as gender,
    date_format(b.birth_date, '%Y-%m-%d') as birth_date,
    b.disability_type as disability_type,
    p.priority_status as priority_status
from beneficiary_info b
left join user_info u1
    on b.family_id = u1.user_id
left join user_info u2
    on b.manager_id = u2.user_id
left join priority p
    on p.priority_id = (
        select max(priority_id)
        from priority
        where bene_id = b.bene_id
    )
where b.bene_id = ?;
`;

const getManagers = `
select
    user_id as user_id,
    user_name as user_name
from user_info
where role = 'MANAGER';
`;

const updateManagerAssign = `
update beneficiary_info
set manager_id = ?
where bene_id = ?;
`;

// manager_log_id가 auto increment가 아니라서 현재는 max + 1 방식으로 넣는다.
// 학습용 프로젝트에서는 이해하기 쉬운 방법이지만,
// 실무에서는 동시성 충돌을 줄이기 위해 auto increment나 sequence가 더 안전하다.
const insertManagerLog = `
insert into manager_log (
    manager_log_id,
    bene_id,
    manager_id,
    assign_date,
    updated_date,
    admin_id
)
values (
    (select coalesce(max(manager_log_id), 0) + 1 from manager_log),
    ?,
    ?,
    now(),
    now(),
    ?
);
`;

// 배정 이력 화면은 manager_id, admin_id 원본 값만으로는 읽기 어렵다.
// 그래서 user_info를 두 번 join 해서 실제 담당자 이름과 배정한 관리자 이름을 같이 내려준다.
const selectManagerAssignHistory = `
select
    l.manager_log_id as manager_log_id,
    l.bene_id as bene_id,
    l.manager_id as manager_id,
    m.user_name as manager_name,
    l.admin_id as admin_id,
    a.user_name as admin_name,
    l.assign_date as assign_date,
    l.updated_date as updated_date
from manager_log l
left join user_info m
    on l.manager_id = m.user_id
left join user_info a
    on l.admin_id = a.user_id
where l.bene_id = ?
order by l.assign_date desc, l.manager_log_id desc;
`;

const priorityLatest = `
select
    priority_id as priority_id,
    bene_id as bene_id,
    priority_status as priority_status,
    progress_status as progress_status,
    approval_date as approval_date,
    rejection_reason as rejection_reason,
    priority_id2 as priority_id2
from priority
where bene_id = ?
order by priority_id desc
limit 1;
`;

const priorityInsert = `
insert into priority (
    bene_id,
    priority_status,
    progress_status,
    approval_date,
    rejection_reason,
    priority_id2
)
values (?, ?, ?, now(), ?, ?);
`;

const priorityRejectHistory = `
select
    priority_id as priority_id,
    priority_status as priority_status,
    progress_status as progress_status,
    rejection_reason as rejection_reason,
    priority_id2 as priority_id2,
    approval_date as approval_date
from priority
where bene_id = ?
  and progress_status = 'rejected'
  and (priority_id = ? or priority_id2 = ?) -- 현재 사이클의 Root ID와 일치하는 것만 필터링
order by priority_id asc;
`;

const priorityCancel = `
delete from priority
where bene_id = ?
  and progress_status = 'pending'
order by priority_id desc
limit 1;
`;

module.exports = {
  BeneList,
  BeneById,
  getManagers,
  updateManagerAssign,
  insertManagerLog,
  selectManagerAssignHistory,
  priorityLatest,
  priorityInsert,
  priorityRejectHistory,
  priorityCancel,
};
