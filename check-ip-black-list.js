const pool = require("./config/db-pool.js");

let IP_WARNING_LIST = [{ IP: "255.000.000.001", dupCnt: 0, lastConnectTime: "20230806000000", timestampDiffSum: 0 }];

// 리턴: true: 블랙, false: 정상
async function blackListCheck(clientIP) {
  const ipBlackCnt = await selectIpBlackList(clientIP);

  // 1. 블랙 list 확인 -> 있으면 블랙 리턴
  if (ipBlackCnt[0].CNT > 0) {
    return true;
  }

  // 2. IP 경고 list 확인
  const connectUser = IP_WARNING_LIST.filter((v) => v.IP === clientIP)[0];
  let tempUser;

  if (connectUser) {
    // 3. 계속 접속 시도 카운팅
    let tempTimeDiff = getTimestampDiff(connectUser.lastConnectTime, getTimestamp());
    tempUser = { ...connectUser, dupCnt: connectUser.dupCnt + 1, lastConnectTime: getTimestamp(), timestampDiffSum: connectUser.timestampDiffSum + tempTimeDiff };

    if (tempUser.timestampDiffSum <= 10) {
      if (tempUser.dupCnt >= 10) {
        // 4. 10초 이내, 10번 이상 접속시 블랙 list 추가, 경고 list 에서 제거
        insertIpBlackList(tempUser);
        IP_WARNING_LIST = IP_WARNING_LIST.filter((w) => w.IP !== clientIP);
        return true;
      }
    } else {
      // 10초 초과시 리셋
      tempUser = { ...connectUser, dupCnt: 0, lastConnectTime: getTimestamp(), timestampDiffSum: 0 };
    }
    // 경고 list 업데이트
    IP_WARNING_LIST = IP_WARNING_LIST.map((w) => (w.IP === clientIP ? { ...w, ...tempUser } : w));
  } else {
    // 신규접속자 일단 경고 list 추가
    IP_WARNING_LIST = IP_WARNING_LIST.concat({ IP: clientIP, dupCnt: 1, lastConnectTime: getTimestamp(), timestampDiffSum: 0 });
  }
  return false;
}

/**
 * 블랙리스트 조회
 * @param
 * @return
 */
async function selectIpBlackList(clietIP) {
  var sql = `SELECT COUNT(*) AS CNT FROM IP_BLACK_LIST WHERE IP = '${clietIP}'`;
  try {
    const result = await pool.query(sql);
    return result[0];
  } catch (err) {
    return err;
  }
}

/**
 * 블랙리스트 저장
 * @param
 * @return
 */
async function insertIpBlackList(p) {
  var sql = `INSERT INTO IP_BLACK_LIST(IP, DUP_CNT, LAST_CONNECT_TIMESTAMP, TIMESTAMP_DIFF_SUM) VALUES ('${p.IP}',${p.dupCnt},'${p.lastConnectTime}',${p.timestampDiffSum} )`;
  console.log("sql:", sql);
  try {
    const result = await pool.query(sql);
    return "ok";
  } catch (err) {
    return err;
  }
}

/**
 * 현재시간 구하기
 * @param
 * @return {string} 현재시간(YYYYMMDDhhmmss)
 */
function getTimestamp() {
  const offset = 1000 * 60 * 60 * 9;
  const koreaNow = new Date(new Date().getTime() + offset);
  return koreaNow
    .toISOString()
    .replace("T", " ")
    .substring(0, 19)
    .replace(/[-\s:]/g, "");
}

/**
 * 시간차이계산
 * @param {string} prevDateTimeStr - 이전시간 문자열(YYYYMMDDhhmmss): ex. 20230805105210
 * @param {string} nextDateTimeStr - 다음시간 문자열
 * @return {number} 시간차이(초)
 */
function getTimestampDiff(prevTimestamp, nextTimestamp) {
  if (!prevTimestamp) return "error:timestampe 포맷이 아님";
  if (!nextTimestamp) return "error:timestampe 포맷이 아님";

  var prevDateTime = new Date(prevTimestamp.replace(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, "$1-$2-$3 $4:$5:$6"));
  var nextDateTime = new Date(nextTimestamp.replace(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, "$1-$2-$3 $4:$5:$6"));
  return (nextDateTime.getTime() - prevDateTime.getTime()) / 1000;
}

module.exports = { blackListCheck };
