<template>
    <div class="container">
        <div class="form-section">
            <h2>회원가입</h2>
            <div class="form-group">
                <label>이름</label>
                <input v-model="form.name" placeholder="실명을 입력하세요" />
            </div>

            <div class="form-group">
                <label>아이디</label>
                <div class="row">
                    <input v-model="form.userId" placeholder="아이디 입력" />
                    <button @click="checkId">중복확인</button>
                </div>
            </div>

            <div class="form-group">
                <label>비밀번호</label>
                <input type="password" v-model="form.password" />
            </div>

            <div class="form-group">
                <label>비밀번호 확인</label>
                <input type="password" v-model="form.passwordConfirm" />
            </div>

            <div class="form-group">
                <label>주소</label>
                <div class="row">
                    <input v-model="from.zipcode" />
                    <button @click="searchAddress">우편번호 검색</button>
                </div>
                <input v-model="from.address" placeholder="주소" />
                <input v-model="from.detailAddress" placeholder="상세주소" />
            </div>

            <div class="form-group">
                <label>소속 기관 선택</label>
                <div class="row">
                    <select v-model="form.region">
                        <option value="">지역</option>
                        <option>서울</option>
                        <option>대구</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup></script>
<style scoped>
.container {
    display: flex;
    justify-content: space-between;
    padding: 40px;
}

.form-section {
    width: 50%;
}

.logo-section {
    width: 40%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.form-group {
    margin-bottom: 15px;
}

.row {
    display: flex;
    gap: 10px;
}

input,
select {
    padding: 8px;
    width: 100%;
}

button {
    padding: 8px 12px;
    cursor: pointer;
}

.submit-btn {
    margin-top: 20px;
    border-radius: 20px;
}
</style>
