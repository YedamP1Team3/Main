const dao = require("../database/DAO"); // 공통 DB 실행 객체 로드
const sql = require("../database/sql/recipient"); // 작성한 SQL 로드
const mapper = require("../database/mappers/recipient_mapper"); // 매퍼 로드

module.exports = {
  registerRecipient: async (recipientData, familyId) => {
    // 매퍼를 통해 데이터를 쿼리 파라미터 배열로 반환
    const params = mapper.mapForInsert(recipientData, familyId);
    try {
      // DAO를 사용하여 DB에 쿼리 실행 및 결과 대기
      const result = await dao.execute(sql.insertRecipient, params);
      // 성공 시 결과 반환(insertId 포함)
      return { success: true, beneId: result.insertId };
    } catch (err) {
      // 에러 발생 시 콘솔 기록 및 상위로 에러 던짐
      console.error("Service Error:", err);
      throw err;
    }
  },

  // familyId를 받아 DB에서 해당 사용자의 대상자 리스트를 가져옴
  getRecipientList: async (familyId) => {
    try {
      // dao.execute를 사용하여 SQL 파일에 정의된 select 쿼리를 실행
      // [주의] sql.selectRecipientList 같은 상수가 sql/recipient 파일에 정의되어 있어야 함
      const rows = await dao.execute(sql.selectRecipientList, [familyId]);

      return { success: true, list: rows }; // 조회된 결과 배열을 반환
    } catch (err) {
      console.error("Sercice GetList Error:", err);
      throw err;
    }
  },
};
