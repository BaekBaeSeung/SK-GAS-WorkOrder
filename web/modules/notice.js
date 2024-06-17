import ExcelJS from 'exceljs';

export function renderNoticePage(container) {
    container.innerHTML = `
        <div class="notice-container">
            <img src="./assets/img/common/color_logo.png" alt="SK 가스 로고" class="logo">
            <div class="header">
                <img src="./assets/img/common/avata.png" alt="Avatar" class="avatar">
                <span class="initial">M</span>
                <div class="time-container">
                    <div class="time-date">
                        <span class="time">10:53</span>
                        <span class="date">240611</span>
                    </div>
                    <span class="day">火</span>
                </div>
            </div>
            <div class="notice" id="notice">
                <p>공지사항 [03] <span class="dash">-</span></p>
            </div>
            <div class="notices">
                <div class="notice-item urgent">
                    <div class="title-date-container">
                        <p class="title" style="color: #F08000;">긴급</p>
                        <p class="date">2024.06.11</p>
                    </div>
                    <ul>
                        <li>UAC C3 loading 온도 이상 발생</li>
                    </ul>
                </div>
                <div class="notice-item">
                    <div class="title-date-container">
                        <p class="title">일반</p>
                        <p class="date">2024.06.11</p>
                    </div>
                    <ul>
                        <li>노후 게이지 교체 일정 확인</li>
                        <li>방폭 스마트폰 시험 사용 참여</li>
                    </ul>
                </div>
                <div class="notice-item">
                    <div class="title-date-container">
                        <p class="title">일반</p>
                        <p class="date">2024.06.10</p>
                    </div>
                    <ul>
                        <li>시설 점검 전후, 무전기 배터리 용량확인</li>
                        <li>배터리 성능 저하 시, 운영실로 반납</li>
                    </ul>
                </div>
            </div>
            <button id="download-excel">📑 엑셀 추출</button>
        </div>
    `;

    document.getElementById('notice').addEventListener('click', () => {
        navigateTo('/schedule');
    });

    /* 엑셀 다운로드 시작*/

    document.getElementById('download-excel').addEventListener('click', async () => {
        try {
            const response = await fetch('/api/notice-data');
            const data = await response.json();

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
            const headerRow = worksheet.addRow(['구분', '', '', 'ITEM NO', 'UNIT', '8:00', '12:00', '16:00', '20:00', '00:00', '4:00']);
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

            // 데이터 추가 및 스타일 설정
            data.forEach((item, index) => {
                const row = worksheet.addRow(item);
                row.eachCell((cell) => {
                    cell.font = { name: '돋움', size: 10 }; // 데이터 행 폰트 설정
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                    cell.border = {
                        top: { style: 'thin', color: { argb: '000000' } },
                        left: { style: 'thin', color: { argb: '000000' } },
                        bottom: { style: 'thin', color: { argb: '000000' } },
                        right: { style: 'thin', color: { argb: '000000' } }
                    };
                });
            });

            // 엑셀 파일 다운로드
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'notices.xlsx';
            link.click();
        } catch (err) {
            console.error("Failed to download Excel file:", err);
        }
    });
}
