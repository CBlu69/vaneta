/* =========================================================
   Jalali (Persian Solar Hijri) calendar utilities
   Pure JS, no dependencies. Based on the standard
   Gregorian <-> Jalali conversion algorithm.
   ========================================================= */
const Jalali = (() => {
  const PERSIAN_DIGITS = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  const WEEKDAYS = ['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنج‌شنبه','جمعه','شنبه'];
  const WEEKDAYS_SHORT = ['ی','د','س','چ','پ','ج','ش'];
  const MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];

  function div(a, b) { return Math.trunc(a / b); }

  function g2d(gy, gm, gd) {
    let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
      + div(153 * ((gm + 9) % 12) + 2, 5)
      + gd - 34840408;
    d = d - div(div(gy + div(gm - 8, 6) + 100100, 100) * 3, 4) + 752;
    return d;
  }

  function d2j(jdn) {
    let gy = 0;
    const j2gTable = jdn - g2d(475, 1, 1) >= 0 ? jdn - g2d(475, 1, 1) : 0;
    return j2gTable;
  }

  // Gregorian -> Jalali
  function toJalali(gy, gm, gd) {
    const gDaysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
    let jy = gy <= 1600 ? 0 : 979;
    gy -= gy <= 1600 ? 621 : 1600;
    const gy2 = (gm > 2) ? (gy + 1) : gy;
    let days = (365 * gy) + (div((gy2 + 3), 4)) - (div((gy2 + 99), 100))
      + (div((gy2 + 399), 400)) - 80 + gd + ((gm > 1) ? [0,31,59,90,120,151,181,212,243,273,304,334][gm - 1] : 0);
    // leap year correction for gm>2 already handled via gy2; recompute properly using standard algorithm:
    return gregorianToJalali(gy + (gy <= 979 ? 621 : 1600), gm, gd);
  }

  // Standard reliable algorithm (jalaali-js derived, public domain logic)
  function isLeapGregorian(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  function gregorianToJulianDay(gy, gm, gd) {
    let a = Math.floor((14 - gm) / 12);
    let y = gy + 4800 - a;
    let m = gm + 12 * a - 3;
    return gd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  }

  function julianDayToGregorian(jdn) {
    let a = jdn + 32044;
    let b = Math.floor((4 * a + 3) / 146097);
    let c = a - Math.floor((146097 * b) / 4);
    let d = Math.floor((4 * c + 3) / 1461);
    let e = c - Math.floor((1461 * d) / 4);
    let m = Math.floor((5 * e + 2) / 153);
    let day = e - Math.floor((153 * m + 2) / 5) + 1;
    let month = m + 3 - 12 * Math.floor(m / 10);
    let year = 100 * b + d - 4800 + Math.floor(m / 10);
    return { gy: year, gm: month, gd: day };
  }

  function jalCal(jy) {
    // Returns leap status using 33-year cycle algorithm (Borkowski)
    const breaks = [-61,9,38,199,426,686,756,818,1111,1181,1210,1635,2060,2097,2192,2262,2324,2394,2456,3178];
    let bl = breaks.length;
    let gy = jy + 621;
    let leapJ = -14;
    let jp = breaks[0];
    if (jy < jp || jy >= breaks[bl - 1]) throw new Error('invalid jalali year ' + jy);
    let jump = 0;
    let n, i;
    for (i = 1; i < bl; i += 1) {
      let jm = breaks[i];
      jump = jm - jp;
      if (jy < jm) break;
      leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
      jp = jm;
    }
    n = jy - jp;
    leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
    if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
    let leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
    let march = 20 + leapJ - leapG;
    if (jump - n < 6) n = n - jump + div(jump, 33) * 33;
    let leap = mod(mod(n + 1, 33) - 1, 4);
    if (leap === -1) leap = 4;
    return { leap, gy, march };
  }

  function mod(a, b) { return a - b * Math.floor(a / b); }

  function gregorianToJalali(gy, gm, gd) {
    const jdn = gregorianToJulianDay(gy, gm, gd);
    return jdnToJalali(jdn);
  }

  function jalCalReverse(jy) {
    return jalCal(jy);
  }

  function jdnToJalali(jdn) {
    let gy = julianDayToGregorian(jdn).gy;
    let jy = gy - 621;
    let r = jalCal(jy);
    let jdn1f = gregorianToJulianDay(r.gy, 3, r.march);
    let k = jdn - jdn1f;
    if (k >= 0) {
      if (k <= 185) {
        let jm = 1 + div(k, 31);
        let jd = mod(k, 31) + 1;
        return { jy, jm, jd };
      } else {
        k -= 186;
      }
    } else {
      jy -= 1;
      k += 179;
      if (r.leap === 1) k += 1;
    }
    let jm = 7 + div(k, 30);
    let jd = mod(k, 30) + 1;
    return { jy, jm, jd };
  }

  function jalaliToJulianDay(jy, jm, jd) {
    let r = jalCal(jy);
    return gregorianToJulianDay(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
  }

  function jalaliToGregorian(jy, jm, jd) {
    const jdn = jalaliToJulianDay(jy, jm, jd);
    return julianDayToGregorian(jdn);
  }

  function isLeapJalaliYear(jy) {
    return jalCal(jy).leap === 0;
  }

  function jalaliMonthLength(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return isLeapJalaliYear(jy) ? 30 : 29;
  }

  function toPersianDigits(input) {
    return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[d]);
  }

  function fromPersianDigits(input) {
    return String(input).replace(/[۰-۹]/g, (d) => PERSIAN_DIGITS.indexOf(d));
  }

  function today() {
    const now = new Date();
    return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }

  function dateToJalali(date) {
    return gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  function weekdayOfDate(date) {
    // JS: 0 = Sunday ... matches WEEKDAYS order directly
    return date.getDay();
  }

  function formatFull(date) {
    const j = dateToJalali(date);
    const wd = WEEKDAYS[weekdayOfDate(date)];
    return `${wd} ${toPersianDigits(j.jd)} ${MONTHS[j.jm - 1]} ${toPersianDigits(j.jy)}`;
  }

  function formatShort(jy, jm, jd) {
    return `${toPersianDigits(jd)} ${MONTHS[jm - 1]} ${toPersianDigits(jy)}`;
  }

  function formatTime(date) {
    let h = date.getHours();
    let m = date.getMinutes();
    return toPersianDigits(String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'));
  }

  return {
    MONTHS, WEEKDAYS, WEEKDAYS_SHORT,
    toPersianDigits, fromPersianDigits,
    gregorianToJalali, jalaliToGregorian,
    today, dateToJalali, formatFull, formatShort, formatTime,
    jalaliMonthLength, isLeapJalaliYear
  };
})();
