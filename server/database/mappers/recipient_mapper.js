module.exports = {
  // 1. [신규 등록용] 화면에서 받은 데이터를 DB의 INSERT 문에 맞게 변환합니다.
  mapForInsert: (data, familyId) => {
    // [관계 처리] '기타'를 선택했다면 직접 입력한 내용을, 아니면 선택한 값을 사용합니다.
    const finalRelation =
      data.relation === "기타" ? data.relationEtc : data.relation;

    // [주소 합치기] 기본 주소와 상세 주소를 하나의 문자열로 합칩니다.
    const fullAddress = `${data.address} ${data.detailAddress}`.trim();

    // [날짜 변환] "19900101"로 들어온 숫자를 "1990-01-01" 형식으로 바꿉니다.
    let formattedBirth = data.birth;
    if (data.birth && data.birth.length === 8) {
      formattedBirth = `${data.birth.substring(0, 4)}-${data.birth.substring(4, 6)}-${data.birth.substring(6, 8)}`;
    }

    // DB의 INSERT ( ? ) 순서에 맞춰 배열로 만들어 돌려줍니다.
    return [
      familyId, // 1. 누구의 대상자인지(보호자 ID)
      data.name, // 2. 대상자 이름
      data.disabilityType, // 3. 장애 유형
      formattedBirth, // 4. 변환된 생년월일
      data.gender === "남성" ? "M" : "F", // 5. 성별 코드
      finalRelation, // 6. 최종 관계
      data.postcode, // 7. 우편번호
      fullAddress, // 8. 합쳐진 전체 주소
    ];
  },

  // 2. [수정용] 화면에서 받은 데이터를 DB의 UPDATE 문에 맞게 변환합니다.
  mapForUpdate: (data, beneId) => {
    // 위와 동일하게 관계, 주소, 날짜를 예쁘게 다듬습니다.
    const finalRelation =
      data.relation === "기타" ? data.relationEtc : data.relation;
    const fullAddress = `${data.address} ${data.detailAddress}`.trim();

    let formattedBirth = data.birth;
    if (data.birth && data.birth.length === 8) {
      formattedBirth = `${data.birth.substring(0, 4)}-${data.birth.substring(4, 6)}-${data.birth.substring(6, 8)}`;
    }

    // [중요] SQL의 UPDATE ... SET ? WHERE bene_id = ? 의 물음표 순서를 지켜야 합니다.
    return [
      data.name, // 1. bene_name
      data.disabilityType, // 2. disability_type
      formattedBirth, // 3. birth_date
      data.gender === "남성" ? "M" : "F", // 4. gender
      finalRelation, // 5. relationship
      data.postcode, // 6. zip_code
      fullAddress, // 7. address
      beneId, // 8. 마지막 WHERE 절에 들어갈 대상자 고유번호
    ];
  },
};
