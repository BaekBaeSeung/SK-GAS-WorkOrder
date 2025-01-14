import ExcelJS from 'exceljs';
import { getCookie } from './utils.js';

export async function downloadExcel(uniqueSchedules) {

    try {
        if (uniqueSchedules.length === 0) {
            throw new Error('스케줄 데이터가 없습니다.');
        }

        const allDetails = [];

        for (const schedule of uniqueSchedules) {

            const response = await fetch('/api/schedule-details-for-excel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    area_name: schedule.area_name,
                    schedule_type: schedule.schedule_type,
                    time: schedule.time,
                    date: schedule.create_at
                }),
            });
            if (!response.ok) {
                throw new Error('스줄 세부 정보를 가져오는데 실패했습니다.');
            }

            const details = await response.json();
            allDetails.push({ schedule, details });

        }

        await generateExcel(allDetails);
    } catch (error) {
        console.error('엑셀 다운로드 중 오류가 발생했습니다:', error);
        alert('엑셀 다운로드 중 오류가 발생했습니다: ' + error.message);
    }
}
// export async function downloadExcel(scheduleData, details) {
//     try {

//         if (!scheduleData.time) {
//             throw new Error('Schedule data is missing or invalid');
//         }

//         if (details.length === 0) {
//             throw new Error('No schedule details found');
//         }

//         // 여기서 필요한 데이터를 가져옵니다.
//         const data = []; // 이 부분은 기존 데이터 구조에 따라 채워넣으세요.

//         await generateExcel(data, scheduleData, details);
//     } catch (error) {
//         console.error('Error downloading excel:', error);
//         alert('엑셀 다운로드 중 오류가 발생했습니다: ' + error.message);
//     }
// }

// async function generateExcel(data, allDetails) {
async function generateExcel(allDetails) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Notices');

    // "◈ Main Area" 제목 추가 및 병합
    worksheet.mergeCells('A1:k1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '◈ Main Area';
    titleCell.font = { name: '돋움', size: 16, bold: true }; // Main Area 폰트 설정
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    // "◈ Main Area" 제목 추가 및 병합


    // 헤더 추가 및 스타일 설정
    const headerRow = worksheet.addRow(['구분', '', '', 'ITEM NO', 'UNIT', '8:00', '12:00', '16:00', '20:00', '00:00', '02:00', '04:00', '06:00']);
    worksheet.mergeCells('A2:C2'); // 한 칸 더 늘려 병합
    headerRow.eachCell((cell, colNumber) => {
        cell.font = { name: '돋움', size: 11, bold: true }; // 2행 폰트 설정
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2CC' } }; // 더 옅은 색으로 설정
        cell.border = {
            top: { style: 'thick', color: { argb: 'FF0000' } },
            left: { style: 'thick', color: { argb: 'FF0000' } },
            bottom: { style: 'thick', color: { argb: 'FF0000' } },
            right: { style: 'thick', color: { argb: 'FF0000' } }
        };
    });
    // 헤더 추가 및 스타일 설정


    // A3부터 A17까지 병합 CHEMICAL =============================================
    worksheet.mergeCells('A3:A17');
    const mergedCell = worksheet.getCell('A3');
    mergedCell.value = 'CHEMICAL';
    mergedCell.font = { name: '돋움', size: 10, bold: true }; // CHEMICAL 폰트 설정
    mergedCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    mergedCell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
    };
    // A3부터 A17까지 병합 CHEMICAL =============================================



    // A18, A19 병합 회수시설 ===================================================
    worksheet.mergeCells('A18:A19');
    const mergedCell18 = worksheet.getCell('A18');
    mergedCell18.value = '회수시설';
    mergedCell18.font = { name: '돋움', size: 10, bold: true }; // 회수시설 폰트 설정
    mergedCell18.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    mergedCell18.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
    };
    // A18, A19 병합 회수시설 ===================================================


    // A20부터 A24까지 병합 AC1831 ==============================================
    worksheet.mergeCells('A20:A24');
    const mergedCell20 = worksheet.getCell('A20');
    mergedCell20.value = 'AC1831';
    mergedCell20.font = { name: '돋움', size: 10, bold: true }; // AC1831 폰트 설정
    mergedCell20.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    mergedCell20.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
    };
    // A20부터 A24까지 병합 AC1831 ==============================================


    // A25부터 A28까지 병합 태광 C3 loading =====================================
    worksheet.mergeCells('A25:A28');
    const mergedCell25 = worksheet.getCell('A25');
    mergedCell25.value = '태광 C3 loading';
    mergedCell25.font = { name: '돋움', size: 10, bold: true }; // 태광 C3 loading 폰트 설정
    mergedCell25.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    mergedCell25.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
    };
    // A25부터 A28까지 병합 태광 C3 loading =====================================


    // A29부터 A32까지 병합 SKA/효성 #2 C3 loading ==============================
    worksheet.mergeCells('A29:A32');
    const mergedCell29 = worksheet.getCell('A29');
    mergedCell29.value = 'SKA/효성 #2 C3 loading';
    mergedCell29.font = { name: '돋움', size: 10, bold: true }; // SKA/효성 #2 C3 loading 폰트 설정
    mergedCell29.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    mergedCell29.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
    };
    // A29부터 A32까지 병합 SKA/효성 #2 C3 loading ==============================


    // A33부터 A35까지 병합 효성 #1 C3 loading ==================================
    worksheet.mergeCells('A33:A35');
    const mergedCell33 = worksheet.getCell('A33');
    mergedCell33.value = '효성 #1 C3 loading';
    mergedCell33.font = { name: '돋움', size: 10, bold: true }; // 효성 #1 C3 loading 폰트 설정
    mergedCell33.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    mergedCell33.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
    };
    // A33부터 A35까지 병합 효성 #1 C3 loading ==================================


    // A36부터 A38까지 병합 SKE C3 unloading ====================================
    worksheet.mergeCells('A36:A38');
    const mergedCell36 = worksheet.getCell('A36');
    mergedCell36.value = 'SKE C3 unloading';
    mergedCell36.font = { name: '돋움', size: 10, bold: true }; // SKE C3 unloading 폰트 설정
    mergedCell36.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    mergedCell36.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
    };
    // A36부터 A38까지 병합 SKE C3 unloading ====================================

    // A39부터 A41까지 병합 SKE C4 unloading ======================================
    worksheet.mergeCells('A39:A41');
    const mergedCell39 = worksheet.getCell('A39');
    mergedCell39.value = 'SKE C4 unloading';
    mergedCell39.font = { name: '돋움', size: 10, bold: true }; // SKE C4 unloading 폰트 설정
    mergedCell39.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    mergedCell39.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
    };
    // A39부터 A41까지 병합 SKE C4 unloading ======================================

    // A42부터 A44까지 병합 SKGC C4 loading ======================================
    worksheet.mergeCells('A42:A44');
    const mergedCell42 = worksheet.getCell('A42');
    mergedCell42.value = 'SKGC C4 loading';
    mergedCell42.font = { name: '돋움', size: 10, bold: true }; // SKGC C4 loading 폰트 설정
    mergedCell42.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    mergedCell42.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
    };
    // A42부터 A44까지 병합 SKGC C4 loading ======================================

    // A45부터 A48까지 병합 카프로 C3 loading ======================================
    worksheet.mergeCells('A45:A47');
    const mergedCell45 = worksheet.getCell('A45');
    mergedCell45.value = '카프로 C3 loading';
    mergedCell45.font = { name: '돋움', size: 10, bold: true }; // 카프로 C3 loading 폰트 설정
    mergedCell45.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    mergedCell45.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
    };
    // A45부터 A48까지 병합 카프로 C3 loading ======================================

    // A49부터 A52까지 병합 UAC C3 loading ======================================
    worksheet.mergeCells('A48:A51');
    const mergedCell48 = worksheet.getCell('A49');
    mergedCell48.value = 'UAC C3 loading';
    mergedCell48.font = { name: '돋움', size: 10, bold: true }; // UAC C3 loading 폰트 설정
    mergedCell48.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    mergedCell48.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
    };
    // A49부터 A52까지 병합 UAC C3 loading ======================================

    // A53부터 A56까지 병합 석화사 출하펌프 ============================================
    worksheet.mergeCells('A52:A55');
    const mergedCell52 = worksheet.getCell('A53');
    mergedCell52.value = '석화사 출하펌프';
    mergedCell52.font = { name: '돋움', size: 10, bold: true }; // 석화사 출하펌프 폰트 설정
    mergedCell52.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    mergedCell52.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
    };
    // A53부터 A56까지 병합 석화사 출하펌프 ============================================

    // A57부터 A58까지 병합 SKE H2 C3 ==================================================
    worksheet.mergeCells('A56:A59');
    const mergedCell56 = worksheet.getCell('A57');
    mergedCell56.value = 'SKE H2 C3';
    mergedCell56.font = { name: '돋움', size: 10, bold: true }; // SKE H2 C3 폰트 설정
    mergedCell56.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    mergedCell56.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
    };
    // A57부터 A58까지 병합 SKE H2 C3 ==================================================

    // A57부터 A58까지 병합 기타 ==================================================
    worksheet.mergeCells('A60:A61');
    const mergedCell60 = worksheet.getCell('A61');
    mergedCell60.value = '기타';
    mergedCell60.font = { name: '돋움', size: 10, bold: true }; // 기타 폰트 설정
    mergedCell60.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    mergedCell60.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
    };
    // A57부터 A58까지 병합 기타 ==================================================

    // B3:C3, B4:C4, ... B17:C17 병합 및 데이터 추가
    const mergedData = [
        'P-701 A Dis\'', 'P-701 B Dis\'', 'P-701 C Dis\'', 'P-751 A Dis\'', 'P-751 B Dis\'',
        'P-721 Dis\'', 'P-722 Dis\'', 'P-711 Dis\'', 'P-713 Dis\'', 'V-721',
        'V-722', 'V-723', 'V-711', 'V-713', 'V-724', 'T-771', 'T-772', 'Discharge Press\'',
        'Motor Inverter (Hz)', 'Receive TK', 'Air Flow', 'Seperator Temp\'', 'Loading Temp\'',
        'Suc\' Press\'', 'Different Press', 'SUM FQ', 'Loading Temp\'', 'Suc\' Press\'',
        'Different Press', 'SUM FQ', 'Loading Temp\'', 'Suc\' Press\'', 'SUM FQ',
        'Receive Temp\'', 'Suc\' Press\'', 'SUM FQ', 'Receive Temp\'', 'Suc\' Press\'',
        'SUM FQ', 'Loading Temp\'', 'Loading Press\'', 'SUM FQ', 'Loading Temp\'',
        'P-704 A/B suc\'', 'SUM FQ', 'Loading Temp\'', 'P-707 A/B Dis\'', 'SUM FQ',
        'P-707 A/B Seal Pot L', 'P-705 A Dis\'', 'P-705 B Dis\'', 'P-705 C Dis\'', 'P-705 A/B/C Seal Pot L',
        'Loading Temp\'', 'P-708 A/B Dis\'', 'SUM FQ', 'P-708 A/B Seal Pot L', 'P-806/T-801',
        '한전 Power'
    ];
    const dColumnData = [

        'PI-701', 'PI-702', 'PI-703', 'PI-704', 'PI-705', 'PI-718', 'PI-719', 'PI-721', 'PI-722', 'LG-701',

        'LG-703', 'LG-723', 'LG-702', 'LG-704', 'PI-724', 'PG-771/LG-771', 'PG-772/LG-772', '-', '-',

        'PI-831', 'FI-831', '-', 'TI-736', 'PI-736', 'PDI-737', 'FQI-736', 'TI-767', 'PI-767', 'PDI-769',

        'FQI-765', 'TI-731', 'PI-731', 'FQI-731', 'TI-751', 'PI-751', 'FQI-727', 'TI-725', 'PI-725', 'FQI-725',

        'TI-726', 'PI-726', 'FQI-726', 'TI-741', 'PI-742A/B', 'FQI-741', 'TI-776', 'PI-771A/B', 'FQI-776', 'P-707 A/B Seal Pot Level',

        'PT-791', 'PT-792', 'PT-793', '\'P-705 A/B/C Seal Pot Level', 'TI-780', 'PI-780A/B', 'FQI-781', 'P-708 A/B Seal Pot Level',

        'PG-812 / Level', 'EE-001/003'

    ];

    const eColumnData = [
    "kg/㎠", "kg/㎠", "kg/㎠", "kg/㎠", "kg/㎠", "kg/㎠", "kg/㎠", "kg/㎠", "kg/㎠",
    "kg/㎠ / cm", "kg/㎠ / cm", "kg/㎠ / cm", "kg/㎠ / cm", "kg/㎠ / cm",
    "kg/㎠", "kg/㎠ / cm", "kg/㎠ / cm", "kg/㎠",
    "Hz", "kg/㎠", "L/min", "℃", "℃", "kg/㎠", "kg/㎠",
    "ton", "℃", "kg/㎠", "kg/㎠", "ton", "℃", "kg/㎠", "ton", "℃", "kg/㎠", "ton", "℃", "kg/㎠",
    "㎥", "℃", "kg/㎠", "㎥", "℃", "kg/㎠", "㎥", "℃", "kg/㎠/amp",
    "㎥", "cm", "kg/㎠ / amp", "kg/㎠ / amp", "kg/㎠ / amp", "cm", "℃", "kg/㎠ / amp",
    "ton", "cm", "kg/㎠ / cm", "역율/kv"
    ];

    for (let i = 3; i <= 61; i++) {
        if (i === 51 || i === 55 || i === 59) {
            worksheet.mergeCells(`B${i}:C${i}`); // 수정된 부분

            const mergedCell = worksheet.getCell(`B${i}`);
            mergedCell.value = mergedData[i - 3];
            mergedCell.font = { name: '돋움', size: 10 }; // 데이터 폰트 설정
            mergedCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            mergedCell.border = {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            };

            const dCell = worksheet.getCell(`D${i}`);
            dCell.value = dColumnData[i - 3];
            dCell.font = { name: '돋움', size: 10 }; // 데이터 폰트 설정
            dCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            dCell.border = {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            };

            const eCell = worksheet.getCell(`E${i}`);
            eCell.value = eColumnData[i - 3];
            eCell.font = { name: '돋움', size: 10 }; // 데이터 폰트 설정
            eCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            eCell.border = {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            };
        } else {
            worksheet.mergeCells(`B${i}:C${i}`);

            const mergedCell = worksheet.getCell(`B${i}`);
            mergedCell.value = mergedData[i - 3];
            mergedCell.font = { name: '돋움', size: 10 }; // 데이터 폰트 설정
            mergedCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            mergedCell.border = {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            };

            const dCell = worksheet.getCell(`D${i}`);
            dCell.value = dColumnData[i - 3];
            dCell.font = { name: '돋움', size: 10 }; // 데이터 폰트 설정
            dCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            dCell.border = {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            };

            const eCell = worksheet.getCell(`E${i}`);
            eCell.value = eColumnData[i - 3];
            eCell.font = { name: '돋움', size: 10 }; // 데이터 폰트 설정
            eCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            eCell.border = {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            };
                    }
                }
            // B3:C3, B4:C4, ... B17:C17 병합

            // 데이터 매핑 객체 생성
            const sectionMapping = {
                'CHEMICAL': { rows: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], valueIndex: 0 },
                '회수시설': { rows: [18, 19], valueIndex: 1 },
                'AC1831': { rows: [20, 21, 22, 23, 24], valueIndex: 2 },
                '태광 C3 loading': { rows: [25, 26, 27, 28], valueIndex: 3 },
                'SKA/효성 #2 C3 loading': { rows: [29, 30, 31, 32], valueIndex: 4 },
                '효성 #1 C3 loading': { rows: [33, 34, 35], valueIndex: 5 },
                'SKE C3 unloading': { rows: [36, 37, 38], valueIndex: 6 },
                'SKE C4 unloading': { rows: [39, 40, 41], valueIndex: 7 },
                'SKGC C4 loading': { rows: [42, 43, 44], valueIndex: 8 },
                '카프로 C3 loading': { rows: [45, 46, 47], valueIndex: 9 },
                'UAC C3 loading': { rows: [48, 49, 50, 51], valueIndex: 10 },
                '석화사 출하펌프': { rows: [52, 53, 54, 55], valueIndex: 11 },
                'SKE H2 C3': { rows: [56, 57, 58, 59], valueIndex: 12 },
                '기타': { rows: [60, 61], valueIndex: 13 }
            };

            allDetails.forEach(({ schedule, details }) => {
    const scheduleTime = schedule.time;
    if (!scheduleTime) {
        console.error('Invalid time in schedule:', schedule);
        return;
    }

    const timeIndex = ['08:00', '12:00', '16:00', '20:00', '00:00', '04:00', '02:00', '06:00'].indexOf(scheduleTime);
    if (timeIndex === -1) {
        console.error('Invalid time in schedule:', scheduleTime);
        return;
    }

    Object.entries(sectionMapping).forEach(([section, info]) => {
        const detail = details.find(d => d.section === section);
        if (detail) {
            const values = detail.value.split(',');
            info.rows.forEach((row, index) => {
                const cell = worksheet.getCell(`${String.fromCharCode(70 + timeIndex)}${row}`);
                cell.value = values[index] || '-';
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.font = { name: '돋움', size: 10 };
                cell.border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } }
                };
            });
        }
    });
});

            // 나머지 셀들에 대해 '-' 값과 테두리 설정
            for (let i = 3; i <= 61; i++) {
                for (let j = 70; j <= 77; j++) { // F to M columns
                    const cell = worksheet.getCell(`${String.fromCharCode(j)}${i}`);
                    if (!cell.value) {
                        cell.value = '-';
                        cell.alignment = { vertical: 'middle', horizontal: 'center' };
                        cell.font = { name: '돋움', size: 10 };
                    }
                    cell.border = {
                        top: { style: 'thin', color: { argb: '000000' } },
                        left: { style: 'thin', color: { argb: '000000' } },
                        bottom: { style: 'thin', color: { argb: '000000' } },
                        right: { style: 'thin', color: { argb: '000000' } }
                    };
                }
            }

            
            

            // 엑셀 파일 다운로드
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'schedule_data.xlsx';
            link.click();
        }
