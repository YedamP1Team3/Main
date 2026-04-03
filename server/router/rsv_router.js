const express = require('express');
const router = express.Router();

const rsvService = require('../service/rsv_service.js');

//담당자 ID 조회
router.get('/manager-id', async (req, res) => {
  try {
    // 나중에는 로그인 정보로 대체
    const userId = req.headers.userid;
    const userRole = req.headers.role;

    const { beneId } = req.query;
    console.log('router.userId, userRole, beneId : ', userId, userRole, beneId);

    const managerId = await rsvService.resolveManagerId({
      userId,
      userRole,
      beneId,
    });

    res.status(200).json({
      success: true,
      managerId,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// -----------------------------------reservation REST--------------------------

// 보호자 -< 지원대상자 조회
router.get('/beneficiaries', async (req, res) => {
  try {
    const familyId = req.headers.userid;

    const list = await rsvService.getBeneficiariesByFamilyId(familyId);

    res.status(200).json({
      success: true,
      data: list,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// 상담예약 신청버튼
router.post('/', async (req, res) => {
  try {
    const { beneId, managerId, date, times } = req.body;

    if (
      !beneId ||
      !managerId ||
      !date ||
      !Array.isArray(times) ||
      times.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'beneId, managerId, date, times는 필수입니다.',
      });
    }

    const result = await rsvService.createReservation(
      beneId,
      managerId,
      date,
      times,
    );

    return res.status(201).json({
      success: true,
      message: '상담 신청이 완료되었습니다.',
      data: result,
    });
  } catch (err) {
    console.error('상담 신청 실패:', err);

    return res.status(500).json({
      success: false,
      message: err.message || '상담 신청 중 오류가 발생했습니다.',
    });
  }
});

// 보호자 전체 지원대상자 상담 신청 내역 조회
router.get('/reservations', async (req, res) => {
  try {
    const userId = req.headers.userid;
    const role = req.headers.role;

    console.log('상담 신청 내역 조회 요청:', { userId, role });

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId가 필요합니다.',
      });
    }

    const reservationList = await rsvService.getFamilyReservations(
      userId,
      role,
    );

    return res.status(200).json({
      success: true,
      data: reservationList,
    });
  } catch (err) {
    console.error('상담 신청 내역 조회 실패:', err);

    return res.status(500).json({
      success: false,
      message: '상담 신청 내역 조회 중 오류가 발생했습니다.',
    });
  }
});

// 상담 신청 취소(삭제)
router.delete('/reservations/:rsvId', async (req, res) => {
  try {
    const { rsvId } = req.params;

    console.log('상담 신청 취소 요청 rsvId:', rsvId);

    if (!rsvId) {
      return res.status(400).json({
        success: false,
        message: 'rsvId가 필요합니다.',
      });
    }

    const result = await rsvService.cancelReservation(rsvId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: '삭제할 예약이 존재하지 않습니다.',
      });
    }

    return res.status(200).json({
      success: true,
      message: '상담 신청이 취소되었습니다.',
    });
  } catch (err) {
    console.error('상담 신청 취소 실패:', err);

    return res.status(500).json({
      success: false,
      message: '상담 신청 취소 중 오류가 발생했습니다.',
    });
  }
});

// -----------------------------------managerSchedule REST--------------------------

// 다음 달 스케줄 수동 생성 테스트용
router.post('/schedule/auto-generate', async (req, res) => {
  try {
    const result = await rsvService.generateNextMonthSchedules();

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// 예약가능 시간 조회 (MANAGER_ID, WORK_DATE)
router.get('/schedule', async (req, res) => {
  try {
    // (ex: ?date=2026-03-24)
    const { managerId, date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'date 파라미터가 필요합니다.',
      });
    }

    const schedule = await rsvService.getManagerSchedule(managerId, date);

    res.status(200).json({
      success: true,
      schedule,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// 담당자 일정조정(예약불가) (MANAGER_ID)
router.post('/blocked-times', async (req, res) => {
  try {
    const { managerId, date, times } = req.body;

    console.log('managerId : ', managerId);
    console.log('date : ', date);
    console.log('times : ', times);

    if (!date || !times || times.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'date와 times가 필요합니다.',
      });
    }

    await rsvService.createBlockedTimes(managerId, date, times);

    res.status(200).json({
      success: true,
      message: '예약불가 시간 등록 완료',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// 예약 가능 처리 (예약불가 해제)
router.delete('/unblock-times', async (req, res) => {
  try {
    const { managerId, date, times } = req.body; // times: ["09:30", "10:00", ...]
    console.log('예약해제.date : ', date);

    if (!date || !times || times.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'date와 times가 필요합니다.',
      });
    }

    const removed = await rsvService.removeBlockedTimes(managerId, date, times);

    res.status(200).json({
      success: true,
      message: '예약 가능 처리 완료',
      removed,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// -----------------------------------manageReservation API--------------------------

router.get('/manager/reservations', async (req, res) => {
  try {
    const { managerId } = req.query;

    if (!managerId) {
      return res.status(400).json({
        success: false,
        message: 'managerId 파라미터가 필요합니다.',
      });
    }

    const reservations = await rsvService.getManagerReservations(managerId);

    return res.status(200).json({
      success: true,
      reservations,
    });
  } catch (err) {
    console.error('담당자 예약 조회 실패:', err);
    return res.status(500).json({
      success: false,
      message: '담당자 예약 조회 실패',
    });
  }
});

router.patch('/manager/reservations/:rsvId/process', async (req, res) => {
  try {
    const { rsvId } = req.params;
    const { decision, rejectReason } = req.body;

    if (!rsvId) {
      return res.status(400).json({
        success: false,
        message: 'rsvId 파라미터가 필요합니다.',
      });
    }

    if (!decision) {
      return res.status(400).json({
        success: false,
        message: 'decision 값이 필요합니다.',
      });
    }

    if (decision === 'REJECTED' && !rejectReason?.trim()) {
      return res.status(400).json({
        success: false,
        message: '반려 사유를 입력해주세요.',
      });
    }

    await rsvService.processReservation(rsvId, decision, rejectReason);

    return res.status(200).json({
      success: true,
      message:
        decision === 'APPROVED'
          ? '예약이 승인되었습니다.'
          : '예약이 반려되었습니다.',
    });
  } catch (err) {
    console.error('예약 처리 실패:', err);

    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || '예약 처리 실패',
    });
  }
});

// -----------------------------------counseling API--------------------------

router.get('/manager/counsel', async (req, res) => {
  try {
    const { managerId } = req.query;

    const list = await rsvService.getManagerCounselList(managerId);

    return res.status(200).json({
      success: true,
      counsels: list,
    });
  } catch (err) {
    console.error('getManagerCounselList error:', err);

    return res.status(400).json({
      success: false,
      message: err.message || '상담일지 관리 목록 조회 실패',
    });
  }
});

router.get('/manager/:rsvId', async (req, res) => {
  try {
    const { rsvId } = req.params;

    const reservation = await rsvService.getCounselReservationByRsvId(rsvId);

    return res.status(200).json({
      success: true,
      reservation,
    });
  } catch (err) {
    console.error('getCounselReservationByRsvId error:', err);

    return res.status(400).json({
      success: false,
      message: err.message || '상담 예약 정보 조회 실패',
    });
  }
});

router.post('/counsel', async (req, res) => {
  try {
    const { rsvId, counselingType, title, content, futurePlan } = req.body;

    const result = await rsvService.createCounselingNote({
      rsvId,
      counselingType,
      title,
      content,
      futurePlan,
    });

    return res.status(201).json({
      success: true,
      message: '상담일지 등록 완료',
      data: result,
    });
  } catch (err) {
    console.error('createCounselingNote error:', err);

    return res.status(500).json({
      success: false,
      message: err.message || '상담일지 등록 실패',
    });
  }
});

router.get('/counsel/:rsvId', async (req, res) => {
  try {
    const { rsvId } = req.params;

    const note = await rsvService.getCounselingNoteByRsvId(rsvId);

    return res.status(200).json({
      success: true,
      note,
    });
  } catch (err) {
    console.error('getCounselingNoteByRsvId error:', err);

    return res.status(404).json({
      success: false,
      message: err.message || '상담일지 조회 실패',
    });
  }
});

// 상담일지 수정
router.put('/counsel/:rsvId', async (req, res) => {
  try {
    const { rsvId } = req.params;
    const { counselingType, title, content, futurePlan } = req.body;

    const result = await rsvService.updateCounselingNote({
      rsvId,
      counselingType,
      title,
      content,
      futurePlan,
    });

    return res.status(200).json({
      success: true,
      message: '상담일지 수정 완료',
      data: result,
    });
  } catch (err) {
    console.error('updateCounselingNote error:', err);

    return res.status(500).json({
      success: false,
      message: err.message || '상담일지 수정 실패',
    });
  }
});

module.exports = router;
