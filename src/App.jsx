import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Grid,
  TextField,
  Button,
  Snackbar,
  Alert,
  Typography,
  Tooltip
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { MdClose, MdEdit } from 'react-icons/md';          
import { MdDelete } from 'react-icons/md';         
import { MdSettings } from 'react-icons/md';
import { FaPlus } from "react-icons/fa";
import {
  FaUsers,
  FaFileInvoice,
  FaBan,
  FaShare,
  FaMoneyBillWave,
  FaTruck,
  FaIndustry,
FaBoxOpen,      
  FaEllipsisH,
 

  FaEdit, FaTrash,

FaTrashAlt, FaTags, FaIdCard,
 

  FaCog,          
  FaCheck,      
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const STORAGE_KEY = "anbar_storage_v1";

export default function AnbarForm() {
  const [topTab, setTopTab] = useState(0);
  const [bottomTab, setBottomTab] = useState(0);
  const [rows, setRows] = useState([]);



  const [isMaximized, setIsMaximized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
const [pendingDeleteId, setPendingDeleteId] = useState(null);
const [editId, setEditId] = useState(null);
const currentIndex = rows.findIndex((r) => r.id === editId);
const currentRecordNumber = currentIndex >= 0 ? currentIndex + 1 : rows.length;
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });


const formFields = [
  { name: "anbar", label: "انبار" },
  { name: "serial", label: "سریال" },
  { name: "tahvilGirande", label: "تحویل گیرنده" },
  { name: "shomareFactor", label: "شماره فاکتور" },
  { name: "tarikhFactor", label: "تاریخ فاکتور", type: "date" },
  { name: "shomareSanad", label: "شماره سند" },
  { name: "moshtari", label: "مشتری" },
  { name: "codeKala", label: "کد کالا" },
  { name: "nameKala", label: "نام کالا" },
  { name: "tedad", label: "تعداد" },
  { name: "gheymat", label: "قیمت" },
  { name: "mablagh", label: "مبلغ" },
  { name: "takhfif", label: "تخفیف" },
  { name: "maliat", label: "مالیات" },
  { name: "jamKol", label: "جمع کل" },
  { name: "tozihat", label: "توضیحات" },
  { name: "address", label: "آدرس" },
  { name: "telefon", label: "تلفن" },
  { name: "mobile", label: "موبایل" },
    { name: "nameenglisi", label: "نام انگلیسی" },
    { name: "tahvildahandekala", label: "تحویل دهنده کالا" },
    { name: "tahvildahandekala", label: "نام تحویل دهنده" },
    { name: "bahayvahed", label: "بهای واحد" },

];
const createInitialForm = () =>
  Object.fromEntries(
    formFields.map((f) => [
      f.name,
      f.type === "date" ? null : "",
    ])
  );


const [form, setForm] = useState(createInitialForm());
const [manualTotals, setManualTotals] = useState(() => {
  const saved = localStorage.getItem("anbar_manual_totals_v1");
  return saved ? JSON.parse(saved) : {};
});

useEffect(() => {
  localStorage.setItem("anbar_manual_totals_v1", JSON.stringify(manualTotals));
}, [manualTotals]);
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored).map((r) => ({
        ...r,
        tarikhFactor: r.tarikhFactor ? dayjs(r.tarikhFactor) : null,
      }));
      setRows(parsed);
    }
  }, []);

  const saveRows = (newRows) => {
    setRows(newRows);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        newRows.map((r) => ({
          ...r,
          tarikhFactor: r.tarikhFactor
            ? dayjs(r.tarikhFactor).format("YYYY-MM-DD")
            : null,
        }))
      )
    );
  };

const handleSave = () => {
  if (editId) {
    const updated = rows.map((r) =>
      r.id === editId ? { ...form, id: editId } : r
    );
    saveRows(updated);
    setEditId(null);
  } else {
    const newRow = { id: Date.now(), ...form, v1: manualTotals.v1 || "",
  v2: manualTotals.v2 || "",
  v3: manualTotals.v3 || "",
  v4: manualTotals.v4 || "", };
    saveRows([...rows, newRow]);
  }

  setForm(createInitialForm());
  setNotification({
    open: true,
    message: editId ? "رکورد ویرایش شد" : "رکورد ثبت شد",
    severity: "success",
  });
};
const handleDelete = (id) => {
  const filtered = rows.filter((r) => r.id !== id);
  saveRows(filtered);
};
const handleEdit = (row) => {
  setForm({
    ...row,
    tarikhFactor: row.tarikhFactor
      ? dayjs(row.tarikhFactor)
      : null,
  });
  setEditId(row.id);
};
const totals = useMemo(() => {
  const sum = (field) =>
    rows.reduce((acc, r) => {
      const val = parseFloat(String(r[field] ?? "0").replace(/[\s,]/g, "")) || 0;
      return acc + val;
    }, 0);

  const calc = {
    jamKala: rows.length,
    jamMeghdar: sum("tedad"),
    jamMablagh: sum("mablagh"),
    jamKol: sum("jamKol"),
    maliatAvarez: sum("maliat"),
    kosoorat: sum("kosoorat") || sum("takhfif") || 0,
    jamGheymatTamam: sum("gheymat") || 0,
    jamArz: sum("arz") || 0,
    jamVazn: sum("vazn") || 0,

    ghabelePardakht:
      sum("jamKol") - (sum("kosoorat") || sum("takhfif") || 0) + sum("maliat"),
  };

  return {
jamKala: manualTotals.jamKala ?? "",
jamMeghdar:manualTotals.jamMeghdar ?? "",
jamMablagh:manualTotals.jamMablagh ?? "",
jamKol:manualTotals.jamKol ?? "",
maliatAvarez:manualTotals.maliatAvarez ?? "",
kosoorat:manualTotals.kosoorat ?? "",
jamGheymatTamam:manualTotals.jamGheymatTamam ?? "",
jamArz:manualTotals.jamArz ?? "",
ghabelePardakht:manualTotals.ghabelePardakht ?? "",
jamVazn:manualTotals.jamVazn ?? "",

    v1: manualTotals.v1 ?? "",
    v2: manualTotals.v2 ?? "",
    v3: manualTotals.v3 ?? "",
    v4: manualTotals.v4 ?? "",

    dahandeKala: manualTotals.dahandeKala ?? "",
    vahedKala: manualTotals.vahedKala ?? "",
    hesabMarboot: manualTotals.hesabMarboot ?? "",

    tafsili2: manualTotals.tafsili2 ?? "",
    tafsili3: manualTotals.tafsili3 ?? "",
    tafsili4: manualTotals.tafsili4 ?? "",
  };
}, [rows, manualTotals]);


const goNext = () => {
  if (!rows.length) return;
  const nextIndex =
    currentIndex < rows.length - 1 ? currentIndex + 1 : 0;
  handleEdit(rows[nextIndex]);
};

const goPrev = () => {
  if (!rows.length) return;
  const prevIndex =
    currentIndex > 0 ? currentIndex - 1 : rows.length - 1;
  handleEdit(rows[prevIndex]);
};

const handleCancelEdit = () => {
  setForm(createInitialForm());
  setEditId(null);
};
const handleEditCurrent = () => {
  if (editId !== null) {
    handleSave();
  } else if (rows.length > 0) {
    const targetIndex = currentIndex >= 0 ? currentIndex : rows.length - 1;
    if (targetIndex >= 0) {
      handleEdit(rows[targetIndex]);
    }
  }
};

const handleDeleteCurrent = () => {
  if (rows.length === 0) return;

  const targetIndex = currentIndex >= 0 ? currentIndex : rows.length - 1;
  if (targetIndex < 0) return;

  const idToDelete = rows[targetIndex].id;

  setPendingDeleteId(idToDelete);
  setConfirmOpen(true);
};

  if (!isVisible) return null;
const statusBtn = {
  minWidth: 60,
  height: 24,
  fontSize: 11,
  padding: "0 8px",
  border: "1px solid #9aa7b7",
  background: "linear-gradient(#ffffff,#dde3ec)",
  color: "#000",
  boxShadow: "inset 0 1px 0 #fff",
  "&:hover": {
    background: "linear-gradient(#ffffff,#cfd8e6)",
  },
};

const navBtn = {
  minWidth: 28,
  height: 24,
  fontSize: 12,
  border: "1px solid #9aa7b7",
  background: "linear-gradient(#ffffff,#dde3ec)",
  boxShadow: "inset 0 1px 0 #fff",
  "&:hover": {
    background: "linear-gradient(#ffffff,#cfd8e6)",
  },
};
const handleConfirm = () => {
  if (!form.nameKala?.trim() && !form.codeKala?.trim()) {
    setNotification({
      open: true,
      message: "حداقل نام کالا یا کد کالا باید وارد شود",
      severity: "warning",
    });
    return;
  }

  if (editId !== null) {
    // حالت ویرایش
    const updated = rows.map((r) =>
      r.id === editId
        ? {
            ...form,
            id: editId,

            // ذخیره ویژگی‌ها از input زیر جدول
            v1: manualTotals.v1 || "",
            v2: manualTotals.v2 || "",
            v3: manualTotals.v3 || "",
            v4: manualTotals.v4 || "",
          }
        : r
    );

    saveRows(updated);

    setNotification({
      open: true,
      message: "رکورد با موفقیت ویرایش شد",
      severity: "success",
    });

    setEditId(null);

  } else {
    // حالت ثبت جدید
    const newRow = {
      id: Date.now(),
      ...form,

      // ذخیره ویژگی‌ها از input زیر جدول
      v1: manualTotals.v1 || "",
      v2: manualTotals.v2 || "",
      v3: manualTotals.v3 || "",
      v4: manualTotals.v4 || "",
    };

    saveRows([...rows, newRow]);

    setNotification({
      open: true,
      message: "رکورد جدید ثبت شد",
      severity: "success",
    });
  }

  // پاک کردن فرم
  setForm(createInitialForm());
};


const columns = useMemo(() => [
    {
    field: "rowNumber",
    headerName: "ردیف",
    width: 80,
    sortable: false,
    filterable: false,
    renderCell: (params) =>
      params.api.getRowIndexRelativeToVisibleRows(params.id) + 1,
  },
     { field: "codeKala", headerName: "کد کالا", flex: 1 },
   { field: "v1", headerName: "ویژگی ۱", flex: 1 },
 { field: "v2", headerName: "ویژگی ۲", flex: 1  },
   { field: "v3", headerName: "ویژگی ۳", flex: 1  },
  { field: "v4", headerName: "ویژگی ۴", flex: 1 },
{ field: "nameKala", headerName: "نام کالا", flex: 1.5 },
  { field: "mablagh", headerName: "مبلغ", width: 120 },
    { field: "nameenglisi", headerName: "نام انگلیسی" },
    { field: "tahvildahandekala", headerName: "تحویل دهنده کالا" },
    { field: "tahvildahandekala", headerName: "نام تحویل دهنده" },
    { field: "bahayvahed", headerName: "بهای واحد" },
 
], []);

  return (
<LocalizationProvider dateAdapter={AdapterDayjs}>
  <Box
    sx={{
      minHeight: "100vh",
      background: "linear-gradient(#dfe9f3, #c3d6ea)",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      pt: 4,
      fontFamily: "Tahoma",
    }}
  >
    <Box
      sx={{
        width: isMaximized ? "100%" : "95%",
        border: "1px solid #7f9db9",
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
        backgroundColor: "#f0f0f0",
        height: isMinimized ? 34 : "auto",
        transition: "all 0.3s ease",
      }}
    >
      <Box
        sx={{
          height: 34,
          background: "linear-gradient(#4f81bd, #2b5797)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          color: "#fff",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FaFileInvoice size={16} />
          <Typography fontSize={13}>رسید ریالی</Typography>
        </Box>

        <Box sx={{ display: "flex" }}>
          <WindowButton onClick={() => setIsMinimized(!isMinimized)}>
            ─
          </WindowButton>

          <WindowButton
            onClick={() => {
              setIsMaximized(!isMaximized);
              setIsMinimized(false);
            }}
          >
            {isMaximized ? "❐" : "□"}
          </WindowButton>

          <WindowButton close onClick={() => setIsVisible(false)}>
            ✕
          </WindowButton>
        </Box>
      </Box>

      {!isMinimized && (
        <Box sx={{ p: 2 }}>
          <Paper sx={{ mb: 2 }}>
            <Tabs
              value={topTab}
              onChange={(e, v) => setTopTab(v)}
              variant="scrollable"
              sx={{
                "& .MuiTabs-flexContainer": {
                  justifyContent: "flex-end",
                },
              }}
            >
              <Tab icon={<FaUsers size={14} />} label="عوامل فاکتور" />
              <Tab icon={<FaFileInvoice size={14} />} label="فراخوانی" />
              <Tab icon={<FaBan size={14} />} label="ابطال" />
              <Tab icon={<FaShare size={14} />} label="ارجاع" />
              <Tab icon={<FaMoneyBillWave size={14} />} label="پرداخت" />
              <Tab icon={<FaTruck size={14} />} label="بارنامه" />
              <Tab icon={<FaIndustry size={14} />} label="اصناف" />
              <Tab icon={<FaTrashAlt size={14} />} label="حذف شده" />
              <Tab icon={<FaTags size={14} />} label="قیمت گذاری" />
              <Tab icon={<FaIdCard size={14} />} label="کارت اعتباری" />
            </Tabs>
          </Paper>

          {/* فرم */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              {formFields.map((field) => (
                <Grid item xs={12} sm={6} md={4} key={field.name}>
                  {field.type === "date" ? (
                    <DatePicker
                      label={field.label}
                      value={form[field.name]}
                      onChange={(v) =>
                        setForm({ ...form, [field.name]: v })
                      }
                      slotProps={{
                        textField: { size: "small", fullWidth: true },
                      }}
                    />
                  ) : (
                    <TextField
                      label={field.label}
                      value={form[field.name]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [field.name]: e.target.value,
                        })
                      }
                      size="small"
                      fullWidth
                    />
                  )}
                </Grid>
              ))}

      
            </Grid>
          </Paper>

          {/* جدول + جمع */}
          <Paper>
            <Tabs
              value={bottomTab}
              onChange={(e, v) => setBottomTab(v)}
                 sx={{
                "& .MuiTabs-flexContainer": {
                  justifyContent: "flex-end",
                },
              }}
            >
             <Tab 
    icon={<FaBoxOpen />} 
    label="اقلام کالا" 
  />
  
  <Tab 
    icon={<FaMoneyBillWave />} 
    label="مالی" 
  />
  
  <Tab 
    icon={<FaEllipsisH />} 
    label="سایر" 
  />
            </Tabs>

            <Box sx={{ height: 400 }}>
         <DataGrid
  rows={[...rows]}   
  columns={columns}
  pageSizeOptions={[5, 10]}
/>
            </Box>

<Box
  sx={{
    borderTop: "1px solid #ccc",
    p: 2,
    backgroundColor: "#f9f9f9",
  }}
>
  <Grid container spacing={2}>

    <Grid item xs={12} md={2}>
      <TextField
        label="ویژگی ۱"
        value={totals.v1 ?? ""}
        onChange={(e) => setManualTotals(prev => ({ ...prev, v1: e.target.value }))}
        size="small"
        fullWidth
      />
    </Grid>

    <Grid item xs={12} md={2}>
      <TextField
        label="ویژگی ۲"
        value={totals.v2 ?? ""}
        onChange={(e) => setManualTotals(prev => ({ ...prev, v2: e.target.value }))}
        size="small"
        fullWidth
      />
    </Grid>

    <Grid item xs={12} md={2}>
      <TextField
        label="ویژگی ۳"
        value={totals.v3 ?? ""}
        onChange={(e) => setManualTotals(prev => ({ ...prev, v3: e.target.value }))}
        size="small"
        fullWidth
      />
    </Grid>

    <Grid item xs={12} md={2}>
      <TextField
        label="ویژگی ۴"
        value={totals.v4 ?? ""}
        onChange={(e) => setManualTotals(prev => ({ ...prev, v4: e.target.value }))}
        size="small"
        fullWidth
      />
    </Grid>

    {/* متنی‌های دیگر */}
    <Grid item xs={12} md={2}>
      <TextField
        label="دهنده کالا"
        value={totals.dahandeKala ?? ""}
        onChange={(e) => setManualTotals(prev => ({ ...prev, dahandeKala: e.target.value }))}
        size="small"
        fullWidth
      />
    </Grid>

    <Grid item xs={12} md={2}>
      <TextField
        label="واحد کالا"
        value={totals.vahedKala ?? ""}
        onChange={(e) => setManualTotals(prev => ({ ...prev, vahedKala: e.target.value }))}
        size="small"
        fullWidth
      />
    </Grid>

    <Grid item xs={12} md={2}>
      <TextField
        label="تفصیلی ۲"
        value={totals.tafsili2 ?? ""}
        onChange={(e) => setManualTotals(prev => ({ ...prev, tafsili2: e.target.value }))}
        size="small"
        fullWidth
      />
    </Grid>

    <Grid item xs={12} md={2}>
      <TextField
        label="تفصیلی ۳"
        value={totals.tafsili3 ?? ""}
        onChange={(e) => setManualTotals(prev => ({ ...prev, tafsili3: e.target.value }))}
        size="small"
        fullWidth
      />
    </Grid>

    <Grid item xs={12} md={2}>
      <TextField
        label="تفصیلی ۴"
        value={totals.tafsili4 ?? ""}
        onChange={(e) => setManualTotals(prev => ({ ...prev, tafsili4: e.target.value }))}
        size="small"
        fullWidth
      />
    </Grid>

    <Grid item xs={12} md={2}>
      <TextField
        label="حساب مرتبط"
        value={totals.hesabMarboot ?? ""}
        onChange={(e) => setManualTotals(prev => ({ ...prev, hesabMarboot: e.target.value }))}
        size="small"
        fullWidth
      />
    </Grid>

    <Grid item xs={12} md={2}>
      <TextField
        label="جمع کالا"
       
                                                                value={totals.jamKala ?? ""}

                onChange={(e) => setManualTotals(prev => ({ ...prev, jamKala: e.target.value }))}

        size="small"
        fullWidth
      />
    </Grid>

    <Grid item xs={12} md={2}>
      <TextField
        label="جمع مقدار"
                                                          value={totals.jamMeghdar ?? ""}

      
           onChange={(e) => setManualTotals(prev => ({ ...prev, jamMeghdar: e.target.value }))}

        size="small"
        fullWidth
      />
    </Grid>

    <Grid item xs={12} md={2}>
      <TextField
        label="جمع مبلغ"
                                                  value={totals.jamMablagh ?? ""}

                  onChange={(e) => setManualTotals(prev => ({ ...prev, jamMablagh: e.target.value }))}

        size="small"
        fullWidth
      />
    </Grid>

    <Grid item xs={12} md={2}>
      <TextField
        label="جمع ارز"
                                          value={totals.jamArz ?? ""}

    
      
                          onChange={(e) => setManualTotals(prev => ({ ...prev, jamArz: e.target.value }))}

        size="small"
        fullWidth
      />
    </Grid>

    <Grid item xs={12} md={2}>
      <TextField
        label="جمع قیمت تمام شده"
                                  value={totals.jamGheymatTamam ?? ""}

                               onChange={(e) => setManualTotals(prev => ({ ...prev, jamGheymatTamam: e.target.value }))}

        size="small"
        fullWidth
      />
    </Grid>

    <Grid item xs={12} md={2}>
      <TextField
        label="جمع وزن"
                          value={totals.jamVazn ?? ""}

                                   onChange={(e) => setManualTotals(prev => ({ ...prev, jamVazn: e.target.value }))}

        size="small"
        fullWidth
      />
    </Grid>

    <Grid item xs={12} md={2}>
      <TextField
        label="کسورات"
                  value={totals.kosoorat ?? ""}
                                        onChange={(e) => setManualTotals(prev => ({ ...prev, kosoorat: e.target.value }))}

        size="small"
        fullWidth
      />
    </Grid>

    <Grid item xs={12} md={2}>
      <TextField
        label="مالیات و عوارض"
                  value={totals.maliatAvarez ?? ""}

     
                                                onChange={(e) => setManualTotals(prev => ({ ...prev, maliatAvarez: e.target.value }))}

        size="small"
        fullWidth
      />
    </Grid>

    <Grid item xs={12} md={2}>
      <TextField
        label="قابل پرداخت"
          value={totals.ghabelePardakht ?? ""}
                                                   onChange={(e) => setManualTotals(prev => ({ ...prev, ghabelePardakht: e.target.value }))}

        size="small"
        fullWidth
     
      />
    </Grid>

  </Grid>
</Box>

          </Paper>
        </Box>
      )}
    </Box>
  </Box>
<Box
  sx={{
    borderTop: "1px solid #b5b5b5",
    backgroundColor: "#e9edf5",
    px: 2,
    py: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 13,
  }}
>
  <div className="flex justify-end items-end"></div>
<Box
  sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",             
    backgroundColor: "#ffffff",
    border: "1px solid #94a8d0",
    borderRadius: "6px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.12), inset 0 1px 2px rgba(255,255,255,0.7)",
    width: "200px",
    height: "50px",
    direction: "rtl",                 
    px: 2,   
    marginRight:"30px"                             
  }}
>
  <Typography
    sx={{
      fontSize: 14,
      fontWeight: 700,
      color: "#0d47a1",
      textAlign: "center",              
      whiteSpace: "nowrap",
    }}
  >
    رکورد جاری 


  </Typography>
  
</Box>

</Box>
<Box
  sx={{
    height: 42,
    borderTop: "1px solid #7f9db9",
    background: "linear-gradient(#eef2f8, #d6dff0)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: 3,
    direction: "rtl",
  }}
>

  {/* سمت چپ صفحه: دکمه‌های عملیات */}
  <Box sx={{ display: "flex", gap: 1.5 }}>
<Button
    size="small"
    variant="outlined"
    color="primary"
    startIcon={<MdEdit size={18} />}  
    sx={{
        ...statusBtn,
        minWidth: 95,
        height: 36,
        fontSize: 12,
        pl: 2.5,
        pr: 1.8,
        justifyContent: "space-between",
        gap: 1.5,
      }}
    onClick={handleEditCurrent}
  >
    ویرایش
  </Button>

  <Button
    size="small"
    variant="outlined"
    color="error"
    sx={{
        ...statusBtn,
        minWidth: 95,
        height: 36,
        fontSize: 12,
        pl: 2.5,
        pr: 1.8,
        justifyContent: "space-between",
        gap: 1.5,
      }}
    startIcon={<MdClose size={18} color="red"/>}
    onClick={handleDeleteCurrent}
  >
    حذف
  </Button>

  <Button
    size="small"
    variant="outlined"
    startIcon={<FaPlus size={18} color="green" />}
    sx={{
        ...statusBtn,
        minWidth: 95,
        height: 36,
        fontSize: 12,
        pl: 2.5,
        pr: 1.8,
        justifyContent: "space-between",
        gap: 1.5,
      }}
  >
    تنظیمات
  </Button>
  </Box>

  {/* وسط صفحه: رکورد جاری – وسط‌چین و برجسته */}
<Box
  sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,                           
 
    
    direction: "rtl",
  }}
>
  <FaChevronRight style={{ fontSize: 20, color: "#555", cursor: "pointer" }} />
  <FaCog style={{ fontSize: 22, color: "#0d47a1" }} />
  <FaChevronLeft style={{ fontSize: 20, color: "#555", cursor: "pointer" }} />
</Box>

  {/* سمت راست صفحه: تایید و انصراف */}
  <Box sx={{ display: "flex", gap: 1.5 }}>
    <Button
      size="small"
      variant="contained"
      color="primary"
     
    onClick={handleConfirm}
      sx={{
        ...statusBtn,
        minWidth: 95,
        height: 36,
        fontSize: 12,
        pl: 2.5,
        pr: 1.8,
        justifyContent: "space-between",
        gap: 1.5,
      }}
    >
       <FaCheck style={{ fontSize: 17, color: editId ? "#0066cc" : "#999" }} />
      تایید
     
    </Button>
    <Button onClick={handleCancelEdit} size="small" variant="outlined" color="inherit"
    
        sx={{
        ...statusBtn,
        minWidth: 95,
        height: 36,
        fontSize: 12,
        pl: 2.5,
        pr: 1.8,
        justifyContent: "space-between",
        gap: 1.5,
      }}
    
    
    >
      <FaTimes style={{ fontSize: 17 }} />
      انصراف
    </Button>
  </Box>
</Box>
  <Snackbar
    open={notification.open}
    autoHideDuration={3000}
    onClose={() =>
      setNotification({ ...notification, open: false })
    }
  >
    <Alert severity={notification.severity}>
      {notification.message}
    </Alert>
  </Snackbar>

<Snackbar
  open={confirmOpen}
  autoHideDuration={null}
  onClose={() => {
    setConfirmOpen(false);
    setPendingDeleteId(null);
  }}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
>
  <Alert
    severity="error"          
    variant="filled"         
    elevation={6}
    action={
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button 
          color="inherit" 
          size="small" 
          variant="outlined"   
          onClick={() => {
            setConfirmOpen(false);
            setPendingDeleteId(null);
          }}
          sx={{ borderColor: 'white', color: 'white' }}
        >
          خیر
        </Button>
        
        <Button 
          color="inherit" 
          size="small" 
          variant="contained"    // ← دکمه بله پررنگ
          sx={{ backgroundColor: 'white', color: '#d32f2f', fontWeight: 'bold' }}
          onClick={() => {
            if (pendingDeleteId !== null) {
              handleDelete(pendingDeleteId);
              setNotification({
                open: true,
                message: "رکورد حذف شد",
                severity: "success",
              });
            }
            setConfirmOpen(false);
            setPendingDeleteId(null);
          }}
        >
بله        </Button>
      </Box>
    }
    sx={{ 
      width: '100%', 
      maxWidth: 500, 
      '& .MuiAlert-message': { width: '100%' },
      fontSize: '1.05rem',
    }}
  >
    <strong>هشدار حذف:</strong> آیا مطمئن هستید که می‌خواهید این رکورد حذف شود؟
  </Alert>
</Snackbar>
</LocalizationProvider>

  );
}

function WindowButton({ children, onClick, close }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: 40,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        userSelect: "none",
        "&:hover": {
          backgroundColor: close ? "#e81123" : "rgba(255,255,255,0.2)",
          color: "#fff",
        },
      }}
    >
      {children}
    </Box>
  );
}
