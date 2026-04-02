const dao = require("../database/DAO"); // 실제 DB에 명령을 전달할 일꾼(DAO)을 가져옵니다.
const sql = require("../database/sql/recipient"); // 미리 짜둔 SQL 명령어들을 가져옵니다.
const mapper = require("../database/mappers/recipient_mapper"); // 데이터 형식을 맞춰줄 통역사를 가져옵니다.

module.exports = {
  // 1. [등록 서비스] 새로운 대상자를 DB에 저장하는 전체 공정입니다.
  registerRecipient: async (recipientData, familyId) => {
    // [통역] 프론트에서 준 날것의 데이터를 DB가 좋아하는 배열 형식으로 변환합니다.
    const params = mapper.mapForInsert(recipientData, familyId);
    try {
      // [실행] 변환된 데이터를 들고 DAO에게 "DB에 가서 저장하고 와!"라고 시킵니다.
      const result = await dao.execute(sql.insertRecipient, params);
      // 성공하면 '성공' 신호와 함께 새로 생성된 대상자의 번호(insertId)를 돌려줍니다.
      return { success: true, beneId: result.insertId };
    } catch (err) {
      console.error("Service Error:", err);
      throw err; // 사고가 나면 상위(Router)에 보고합니다.
    }
  },

  // 2. [목록 조회 서비스] 내가 등록한 대상자들을 싹 다 가져옵니다.
  getRecipientList: async (familyId) => {
    try {
      // [조회] 내 ID(familyId)를 조건으로 해서 연결된 모든 대상자 줄을 가져옵니다.
      const rows = await dao.execute(sql.selectRecipientList, [familyId]);

      // 성공 시 '성공' 신호와 함께 명단(list)을 통째로 돌려줍니다.
      return { success: true, list: rows };
    } catch (err) {
      console.error("Service GetList Error:", err);
      throw err;
    }
  },

  // 3. [상세 조회 서비스] 딱 한 명의 정보만 자세히 들여다볼 때 사용합니다.
  getRecipientDetail: async (beneId) => {
    try {
      // 대상자의 고유 번호(beneId)로 검색을 실행합니다.
      const rows = await dao.execute(sql.selectRecipientById, [beneId]);
      // 결과는 배열로 오지만, 한 명만 찾을 것이므로 첫 번째 칸(rows[0])만 돌려줍니다.
      return rows[0];
    } catch (err) {
      throw err;
    }
  },

  // 4. [수정 서비스] 기존 대상자의 정보를 새 내용으로 바꾸는 공정입니다.
  updateRecipient: async (beneId, recipientData) => {
    try {
      // [통역] 수정용 매퍼를 써서 데이터 순서를 UPDATE 문에 맞게 정렬합니다.
      const params = mapper.mapForUpdate(recipientData, beneId);
      // [실행] DAO에게 수정 명령을 내립니다.
      const result = await dao.execute(sql.updateRecipient, params);
      // 바뀐 줄(affectedRows)이 0보다 크면 수정 성공으로 판단합니다.
      return { success: result.affectedRows > 0 };
    } catch (err) {
      throw err;
    }
  },
};
