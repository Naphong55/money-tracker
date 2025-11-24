import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus, X } from 'lucide-react';

export default function App() {
  // สถานะสำหรับเปิด/ปิดฟอร์ม
  const [isFormOpen, setIsFormOpen] = useState(false);

  // สถานะสำหรับเก็บข้อมูลในฟอร์ม
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense'); 

  // ⭐️ ส่วนที่แก้: โหลดข้อมูลจากเครื่องตอนเริ่มแอป (LocalStorage)
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('money-tracker-data');
    if (saved) {
      return JSON.parse(saved);
    }
    // ถ้าไม่มีข้อมูลเก่า ให้เริ่มด้วยข้อมูลตัวอย่าง (หรือจะใส่ [] ให้ว่างเปล่าก็ได้)
    return []; 
  });

  // ⭐️ ส่วนที่เพิ่ม: สั่งให้บันทึกข้อมูลลงเครื่อง "ทุกครั้ง" ที่ transactions เปลี่ยนแปลง
  useEffect(() => {
    localStorage.setItem('money-tracker-data', JSON.stringify(transactions));
  }, [transactions]);

  // ฟังก์ชันคำนวณยอดเงิน
  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;

  // ฟังก์ชันบันทึกข้อมูล
  const handleSave = (e) => {
    e.preventDefault();
    
    if (!text || !amount) return;

    const newTransaction = {
      id: Date.now(),
      text: text,
      amount: parseFloat(amount),
      type: type,
      date: new Date().toISOString()
    };

    setTransactions([newTransaction, ...transactions]);
    
    setText('');
    setAmount('');
    setIsFormOpen(false);
  };

  // ฟังก์ชันลบรายการ (แถมให้ครับ! เผื่อกดผิด)
  const handleDelete = (id) => {
    const confirmed = window.confirm("ต้องการลบรายการนี้ใช่ไหม?");
    if (confirmed) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 font-sans relative">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        
        {/* ส่วนหัว */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white text-center rounded-b-3xl shadow-lg relative z-10 shrink-0">
          <div className="flex justify-center mb-2 opacity-80">
            <Wallet size={24} />
          </div>
          <h1 className="text-lg font-medium opacity-90 mb-1">ยอดเงินคงเหลือ</h1>
          <div className="text-5xl font-bold mb-8">฿{balance.toLocaleString()}</div>

          <div className="flex justify-between gap-4">
            <div className="bg-white/20 rounded-2xl p-3 flex-1 backdrop-blur-sm border border-white/10">
              <div className="flex items-center justify-center gap-1 mb-1 text-sm opacity-90">
                <div className="bg-green-400/30 p-1 rounded-full"><TrendingUp size={14} /></div>
                รายรับ
              </div>
              <div className="text-lg font-semibold">+{income.toLocaleString()}</div>
            </div>
            <div className="bg-white/20 rounded-2xl p-3 flex-1 backdrop-blur-sm border border-white/10">
              <div className="flex items-center justify-center gap-1 mb-1 text-sm opacity-90">
                <div className="bg-red-400/30 p-1 rounded-full"><TrendingDown size={14} /></div>
                รายจ่าย
              </div>
              <div className="text-lg font-semibold">-{expense.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* ส่วนรายการ */}
        <div className="p-6 flex-1 overflow-y-auto">
          <h2 className="text-gray-600 font-bold text-lg mb-4">ประวัติธุรกรรมล่าสุด</h2>
          
          <div className="space-y-3 pb-20">
            {transactions.length === 0 && (
              <div className="text-center text-gray-400 mt-10 flex flex-col items-center">
                <p>ยังไม่มีรายการ</p>
                <p className="text-sm">กดปุ่ม + ด้านล่างเพื่อเริ่มจดบันทึก</p>
              </div>
            )}
            
            {transactions.map((t) => (
              <div 
                key={t.id} 
                onClick={() => handleDelete(t.id)} // คลิกเพื่อลบ
                className="group flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer active:scale-95"
                title="คลิกเพื่อลบรายการ"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {t.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-base">{t.text}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(t.date).toLocaleDateString('th-TH')} {new Date(t.date).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})} น.
                    </span>
                  </div>
                </div>
                <span className={`font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ปุ่มเพิ่มรายการ */}
        <div className="p-4 bg-white/80 backdrop-blur-sm border-t sticky bottom-0">
           <button 
             onClick={() => setIsFormOpen(true)}
             className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition flex items-center justify-center gap-2 text-lg">
             <Plus size={24} /> เพิ่มรายการใหม่
           </button>
        </div>

      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">เพิ่มรายการ</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-3 rounded-lg font-bold transition ${type === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  รายจ่าย
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-3 rounded-lg font-bold transition ${type === 'income' ? 'bg-white text-green-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  รายรับ
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ชื่อรายการ</label>
                <input
                  type="text"
                  placeholder="เช่น ข้าวมันไก่, เงินเดือน"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none font-medium"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">จำนวนเงิน</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none font-bold text-xl"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition mt-4"
              >
                บันทึกข้อมูล
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}