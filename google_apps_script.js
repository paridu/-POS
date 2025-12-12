/**
 * Google Apps Script for POS System
 * นำโค้ดนี้ไปวางใน Google Apps Script Editor (Extensions > Apps Script)
 * แล้วทำการ Deploy เป็น Web App 
 * 
 * สำคัญมาก:
 * 1. Execute as: "Me" (ตัวคุณเอง)
 * 2. Who has access: "Anyone" (ใครก็ได้) -> จำเป็นเพื่อให้ Web App ส่งข้อมูลได้โดยไม่ติด CORS
 */

const SHEET_NAME = "Sales";

// รองรับ GET request เพื่อใช้ทดสอบว่า URL ทำงานปกติหรือไม่
function doGet(e) {
  return createResponse({ 
    status: "success", 
    message: "Connection successful. Send POST request to sync data." 
  });
}

function doPost(e) {
  // สร้าง Lock เพื่อป้องกันการเขียนชนกัน
  const lock = LockService.getScriptLock();
  
  try {
    // รอ Lock สูงสุด 10 วินาที
    const success = lock.tryLock(10000);
    if (!success) {
      return createResponse({ status: "error", message: "Server is busy, please try again." });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // 1. สร้าง Sheet ถ้ายังไม่มี
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // สร้าง Header
      sheet.appendRow([
        "Sale ID", 
        "Date", 
        "Time", 
        "Customer Name", 
        "Payment Method", 
        "Product Name", 
        "Quantity", 
        "Price", 
        "Subtotal", 
        "Discount", 
        "Total Sale Amount"
      ]);
    }

    // 2. รับข้อมูล JSON
    if (!e || !e.postData || !e.postData.contents) {
       return createResponse({ status: "error", message: "No data received" });
    }

    const requestData = JSON.parse(e.postData.contents);
    const sales = requestData.sales;

    if (!sales || !Array.isArray(sales)) {
      return createResponse({ status: "error", message: "Invalid data format: 'sales' array missing" });
    }

    // 3. ตรวจสอบ ID ซ้ำ เพื่อป้องกันการบันทึกซ้ำ
    const existingIds = new Set();
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const idColumn = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      idColumn.forEach(row => existingIds.add(String(row[0])));
    }

    const newRows = [];

    // 4. วนลูปเตรียมข้อมูลลงตาราง
    sales.forEach(sale => {
      // ถ้ามี Sale ID นี้อยู่แล้ว ให้ข้าม
      if (existingIds.has(String(sale.id))) {
        return; 
      }

      const dateObj = new Date(sale.date);
      const dateStr = dateObj.toLocaleDateString("th-TH");
      const timeStr = dateObj.toLocaleTimeString("th-TH");

      // Flatten Data: 1 รายการสินค้า = 1 แถว
      sale.items.forEach(item => {
        newRows.push([
          sale.id,
          dateStr,
          timeStr,
          sale.customerId || "General Customer",
          sale.paymentMethod,
          item.productName,
          item.quantity,
          item.price,
          item.subtotal,
          sale.discount,
          sale.finalAmount 
        ]);
      });
    });

    // 5. บันทึกลง Sheet
    if (newRows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
      return createResponse({ status: "success", message: `Saved ${newRows.length} items.` });
    } else {
      return createResponse({ status: "success", message: "No new data to save." });
    }

  } catch (error) {
    return createResponse({ status: "error", message: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ฟังก์ชันเทส (สำหรับกด Run ใน Editor)
function testDoPost() {
  const mockE = {
    postData: {
      contents: JSON.stringify({
        sales: [{
          id: "TEST_LOCAL_001",
          date: new Date().toISOString(),
          finalAmount: 100,
          paymentMethod: "cash",
          items: [{ productName: "Test Item", quantity: 1, price: 100, subtotal: 100 }]
        }]
      })
    }
  };
  console.log(doPost(mockE).getContent());
}