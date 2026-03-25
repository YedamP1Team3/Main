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
};
