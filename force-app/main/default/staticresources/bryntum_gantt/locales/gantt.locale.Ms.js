/*!
 *
 * Bryntum Gantt 5.6.10 (TRIAL VERSION)
 *
 * Copyright(c) 2024 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
(function(d,l){var o=typeof exports=="object";if(typeof define=="function"&&define.amd)define([],l);else if(typeof module=="object"&&module.exports)module.exports=l();else{var m=l(),g=o?exports:d;for(var c in m)g[c]=m[c]}})(typeof self<"u"?self:void 0,()=>{var d={},l={exports:d},o=Object.defineProperty,m=Object.getOwnPropertyDescriptor,g=Object.getOwnPropertyNames,c=Object.prototype.hasOwnProperty,b=(a,e,n)=>e in a?o(a,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):a[e]=n,y=(a,e)=>{for(var n in e)o(a,n,{get:e[n],enumerable:!0})},T=(a,e,n,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of g(e))!c.call(a,t)&&t!==n&&o(a,t,{get:()=>e[t],enumerable:!(i=m(e,t))||i.enumerable});return a},S=a=>T(o({},"__esModule",{value:!0}),a),D=(a,e,n)=>(b(a,typeof e!="symbol"?e+"":e,n),n),k={};y(k,{default:()=>j}),l.exports=S(k);var s=typeof self<"u"?self:typeof globalThis<"u"?globalThis:null,h=class p{static mergeLocales(...e){let n={};return e.forEach(i=>{Object.keys(i).forEach(t=>{typeof i[t]=="object"?n[t]={...n[t],...i[t]}:n[t]=i[t]})}),n}static trimLocale(e,n){let i=(t,r)=>{e[t]&&(r?e[t][r]&&delete e[t][r]:delete e[t])};Object.keys(n).forEach(t=>{Object.keys(n[t]).length>0?Object.keys(n[t]).forEach(r=>i(t,r)):i(t)})}static normalizeLocale(e,n){if(!e)throw new Error('"nameOrConfig" parameter can not be empty');if(typeof e=="string"){if(!n)throw new Error('"config" parameter can not be empty');n.locale?n.name=e||n.name:n.localeName=e}else n=e;let i={};if(n.name||n.locale)i=Object.assign({localeName:n.name},n.locale),n.desc&&(i.localeDesc=n.desc),n.code&&(i.localeCode=n.code),n.path&&(i.localePath=n.path);else{if(!n.localeName)throw new Error(`"config" parameter doesn't have "localeName" property`);i=Object.assign({},n)}for(let t of["name","desc","code","path"])i[t]&&delete i[t];if(!i.localeName)throw new Error("Locale name can not be empty");return i}static get locales(){return s.bryntum.locales||{}}static set locales(e){s.bryntum.locales=e}static get localeName(){return s.bryntum.locale||"En"}static set localeName(e){s.bryntum.locale=e||p.localeName}static get locale(){return p.localeName&&this.locales[p.localeName]||this.locales.En||Object.values(this.locales)[0]||{localeName:"",localeDesc:"",localeCoode:""}}static publishLocale(e,n){let{locales:i}=s.bryntum,t=p.normalizeLocale(e,n),{localeName:r}=t;return!i[r]||n===!0?i[r]=t:i[r]=this.mergeLocales(i[r]||{},t||{}),i[r]}};D(h,"skipLocaleIntegrityCheck",!1);var u=h;s.bryntum=s.bryntum||{},s.bryntum.locales=s.bryntum.locales||{},u._$name="LocaleHelper";var M={localeName:"Ms",localeDesc:"Melayu",localeCode:"ms",RemoveDependencyCycleEffectResolution:{descriptionTpl:"Buang kebergantungan"},DeactivateDependencyCycleEffectResolution:{descriptionTpl:"Nyahaktifkan kebergantungan"},CycleEffectDescription:{descriptionTpl:"Kitaran telah ditemui, dibentuk oleh: {0}"},EmptyCalendarEffectDescription:{descriptionTpl:'"{0}" kalendar tidak memberikan sebarang jeda masa bekerja.'},Use24hrsEmptyCalendarEffectResolution:{descriptionTpl:"Guna kalendar 24 jam dengan Sabtu dan Ahad tidak bekerja."},Use8hrsEmptyCalendarEffectResolution:{descriptionTpl:"Guna kalendar 8 jam (08:00-12:00, 13:00-17:00) dengan Sabtu dan Ahad tidak bekerja."},IgnoreProjectConstraintResolution:{descriptionTpl:"Abaikan sempadan projek dan teruskan dengan perubahan."},ProjectConstraintConflictEffectDescription:{startDescriptionTpl:'Anda memindahkan tugas "{0}" untuk memulakan {1}. Ini adalah sebelum tarikh permulaan projek {2}.',endDescriptionTpl:'Anda memindahkan tugas "{0}" untuk menyelesaikan {1}. Ini adalah selepas tarikh akhir projek {2}.'},HonorProjectConstraintResolution:{descriptionTpl:"Laraskan tugas untuk menghormati sempadan projek."},ConflictEffectDescription:{descriptionTpl:"Konflik penjadualan telah ditemui: {0} berkonflik dengan {1}"},ConstraintIntervalDescription:{dateFormat:"LLL"},ProjectConstraintIntervalDescription:{startDateDescriptionTpl:"Tarikh mula projek {0}",endDateDescriptionTpl:"Tarikh tamat projek {0}"},DependencyType:{long:["Mula ke Mula","Mula ke Selesai","Selesai ke Mula","Selesai ke Selesai"]},ManuallyScheduledParentConstraintIntervalDescription:{startDescriptionTpl:'Dijadualkan secara manual "{2}" memaksa anak-anaknya untuk bermula tidak lewat daripada {0}',endDescriptionTpl:'Dijadualkan secara manual "{2}" memaksa anak-anaknya menyelesaikan tidak lewat daripada {1}'},DisableManuallyScheduledConflictResolution:{descriptionTpl:'Dinyahdayakan penjadualan manual untuk "{0}"'},DependencyConstraintIntervalDescription:{descriptionTpl:'Kebergantungan ({2}) daripada "{3}" kepada "{4}"'},RemoveDependencyResolution:{descriptionTpl:'Buang kebergantugan daripada "{1}" kepada "{2}"'},DeactivateDependencyResolution:{descriptionTpl:'Nyahaktifkan kebergantungan daripada "{1}" kepada "{2}"'},DateConstraintIntervalDescription:{startDateDescriptionTpl:'Tugas "{2}" {3} {0} kekangan',endDateDescriptionTpl:'Tugas "{2}" {3} {1} kekangan',constraintTypeTpl:{startnoearlierthan:"Mula tidak awal daripada",finishnoearlierthan:"Selesai tidak awal daripada",muststarton:"Mesti mula pada",mustfinishon:"Mesti selesai ada",startnolaterthan:"Mula tidak lewat daripada",finishnolaterthan:"Selesai tidak lewat daripada"}},RemoveDateConstraintConflictResolution:{descriptionTpl:'Buang "{1}" kekangan tugas "{0}"'}},N=u.publishLocale(M),v={localeName:"Ms",localeDesc:"Melayu",localeCode:"ms",Object:{Yes:"Ya",No:"Tidak",Cancel:"Batal",Ok:"OK",Week:"Minggu",None:"Tiada"},ColorPicker:{noColor:"Tiada warna"},Combo:{noResults:"Tiada keputusan",recordNotCommitted:"Rekod tidak boleh ditambah",addNewValue:a=>`Tambah ${a}`},FilePicker:{file:"Fail"},Field:{badInput:"Nilai medan tak sah",patternMismatch:"Nilai harus sepadan dengan corak tertentu",rangeOverflow:a=>`Nilai mestilah kurang daripada atau sama dengan ${a.max}`,rangeUnderflow:a=>`Nilai mestilah lebih besar daripada atau sama dengan ${a.max}`,stepMismatch:"Nilai harus sesuai dengan langkah",tooLong:"Nilai harus lebih pendek",tooShort:"Nilai harus lebih panjang",typeMismatch:"Nilai diperlukan dalam format khas",valueMissing:"Medan ini diperlukan",invalidValue:"Nilai medan tak sah",minimumValueViolation:"Pelanggaran nilai minimum",maximumValueViolation:"Pelanggaran nilai maksimum",fieldRequired:"Medan ini diperlukan",validateFilter:"Nilai mesti dipilih daripada senarai"},DateField:{invalidDate:"Input tarikh tidak sah"},DatePicker:{gotoPrevYear:"Pergi ke tahun sebelumnya",gotoPrevMonth:"Pergi ke bulan sebelumnya",gotoNextMonth:"Pergi ke bulan berikutnya",gotoNextYear:"Pergi ke tahun berikutnya"},NumberFormat:{locale:"ms",currency:"MYR"},DurationField:{invalidUnit:"Unit tak sah"},TimeField:{invalidTime:"Input masa tak sah"},TimePicker:{hour:"Jam",minute:"Minit",second:"Saat"},List:{loading:"Memuatkan...",selectAll:"Pilih Semua"},GridBase:{loadMask:"Memuatkan...",syncMask:"Menyimpan perubahan, sila tunggu..."},PagingToolbar:{firstPage:"Pergi ke halaman pertama",prevPage:"Pergi ke halaman sebelumnya",page:"Halaman",nextPage:"Pergi ke halaman berikutnya",lastPage:"Pergi ke halaman terakhir",reload:"Muat semula halaman semasa",noRecords:"Tiada rekod untuk dipaparkan",pageCountTemplate:a=>`daripada ${a.lastPage}`,summaryTemplate:a=>`Memaparkan rekod ${a.start} - ${a.end} daripada ${a.allCount}`},PanelCollapser:{Collapse:"Kecil",Expand:"Kembang"},Popup:{close:"Tutup Pop Timbul"},UndoRedo:{Undo:"Buat Asal",Redo:"Buat Semula",UndoLastAction:"Buat asal tindakan terakhir",RedoLastAction:"Buat semula tindakan buat asal yang terakhir",NoActions:"Tiada item dalam baris gilir buat asal"},FieldFilterPicker:{equals:"sama dengan",doesNotEqual:"tidak sama dengan",isEmpty:"kosong",isNotEmpty:"tidak kosong",contains:"mengandungi",doesNotContain:"tidak mengandungi",startsWith:"bermula dengan",endsWith:"berakhir dengan",isOneOf:"salah satu daripada",isNotOneOf:"bukan salah satu daripada",isGreaterThan:"lebih besar daripada",isLessThan:"kurang daripada",isGreaterThanOrEqualTo:"lebih besar daripada atau sama dengan",isLessThanOrEqualTo:"kurang daripada atau sama dengan",isBetween:"antara",isNotBetween:"tidak antara",isBefore:"sebelum",isAfter:"selepas",isToday:"hari ini",isTomorrow:"esok",isYesterday:"semalam",isThisWeek:"minggu ini",isNextWeek:"minggu depan",isLastWeek:"minggu lepas",isThisMonth:"bulan ini",isNextMonth:"bulan depan",isLastMonth:"bulan lepas",isThisYear:"tahun ini",isNextYear:"tahun depan",isLastYear:"tahun lepas",isYearToDate:"tahun hingga kini",isTrue:"betul",isFalse:"salah",selectAProperty:"Pilih properti",selectAnOperator:"Pilih operator",caseSensitive:"Sensitif huruf",and:"dan",dateFormat:"D/M/YY",selectValue:"Pilih nilai",selectOneOrMoreValues:"Pilih satu atau lebih nilai",enterAValue:"Masukkan nilai",enterANumber:"Masukka nombor",selectADate:"Pilih tarikh",selectATime:"Pilih masa"},FieldFilterPickerGroup:{addFilter:"Tambah penapis"},DateHelper:{locale:"ms",weekStartDay:1,nonWorkingDays:{0:!0,6:!0},weekends:{0:!0,6:!0},unitNames:[{single:"milisaat",plural:"ms",abbrev:"ms"},{single:"saat",plural:"saat",abbrev:"s"},{single:"minit",plural:"minit",abbrev:"min"},{single:"jam",plural:"jam",abbrev:"j"},{single:"hari",plural:"hari",abbrev:"h"},{single:"minggu",plural:"minggu",abbrev:"m"},{single:"bulan",plural:"bulan",abbrev:"bul"},{single:"sukutahun",plural:"sukutahun",abbrev:"st"},{single:"tahun",plural:"tahun",abbrev:"th"},{single:"dekad",plural:"dekad",abbrev:"dek"}],unitAbbreviations:[["mil"],["s","saat"],["m","min"],["j","jam"],["h"],["m","mg"],["b","bul","bln"],["st","suku","skt"],["t","th"],["dek"]],parsers:{L:"DD-MM-YYYY",LT:"HH:mm",LTS:"HH:mm:ss A"},ordinalSuffix:a=>"ke-"+a}},R=u.publishLocale(v),f=new String,C={localeName:"Ms",localeDesc:"Melayu",localeCode:"ms",ColumnPicker:{column:"Kolum",columnsMenu:"Kolum",hideColumn:"Sembunyi kolum",hideColumnShort:"Sembunyi",newColumns:"Kolum baharu"},Filter:{applyFilter:"Guna penapis",filter:"Penapis",editFilter:"Edit penapis",on:"Hidup",before:"Sebelum",after:"Selepas",equals:"Sama dengan",lessThan:"Kurang daripada",moreThan:"Lebih daripada",removeFilter:"Buang penapis",disableFilter:"Nyahdaya penapis"},FilterBar:{enableFilterBar:"Tunjuk bar penapis",disableFilterBar:"Sembunyi bar penapis"},Group:{group:"Kumpulan",groupAscending:"Kumpulan menaik",groupDescending:"Kumpulan menurun",groupAscendingShort:"Menaik",groupDescendingShort:"Menurun",stopGrouping:"Henti mengumpulkan",stopGroupingShort:"Henti"},HeaderMenu:{moveBefore:a=>`Gerak sebelum "${a}"`,moveAfter:a=>`Gerak selepas "${a}"`,collapseColumn:"Runtuh lajur",expandColumn:"Kembang lajur"},ColumnRename:{rename:"Nama semula"},MergeCells:{mergeCells:"Gabung sel",menuTooltip:"Gabungkan sel dengan nilai yang sama apabila diisih mengikut kolum ini"},Search:{searchForValue:"Cari nilai"},Sort:{sort:"Isih",sortAscending:"Isih menaik",sortDescending:"Isih menurun",multiSort:"Multi isih",removeSorter:"Buang pengisih",addSortAscending:"Tambah pengisih menaik",addSortDescending:"Tambah pengisih menurun",toggleSortAscending:"Tukar kepada menaik",toggleSortDescending:"Tukar kepada menurun",sortAscendingShort:"Menaik",sortDescendingShort:"Menurun",removeSorterShort:"Buang",addSortAscendingShort:"+ Menaik",addSortDescendingShort:"+ Menurun"},Split:{split:"Bahagi",unsplit:"Tidak Dipisah",horizontally:"Secara Menegak",vertically:"Secara Mendatar",both:"Kedua-duanya"},Column:{columnLabel:a=>`${a.text?`${a.text} kolum. `:""}SPACE untuk menu konteks${a.sortable?", ENTER untuk isih":""}`,cellLabel:f},Checkbox:{toggleRowSelect:"Togel pemilihan baris",toggleSelection:"Togel pemilihan set data keseluruhan"},RatingColumn:{cellLabel:a=>{var e;return`${a.text?a.text:""} ${(e=a.location)!=null&&e.record?` penilaian : ${a.location.record.get(a.field)||0}`:""}`}},GridBase:{loadFailedMessage:"Pemuatan data gagal!",syncFailedMessage:"Sinkronisasi data gagal!",unspecifiedFailure:"Kegagalan tak dinyata",networkFailure:"Ralat rangkaian",parseFailure:"Gagal menghuraikan respons pelayan",serverResponse:"Respons pelayan:",noRows:"Tiada rekod untuk dipaparkan",moveColumnLeft:"Gerak ke bahagian kiri",moveColumnRight:"Gerak ke bahagian kanan",moveColumnTo:a=>`Gerak kolum ke ${a}`},CellMenu:{removeRow:"Hapus"},RowCopyPaste:{copyRecord:"Salin",cutRecord:"Potong",pasteRecord:"Tampal",rows:"baris-baris",row:"baris"},CellCopyPaste:{copy:"Salin",cut:"Potong",paste:"Tampal"},PdfExport:{"Waiting for response from server":"Menunggu respons daripada pelayan...","Export failed":"Eksport gagal","Server error":"Ralat pelayan","Generating pages":"Menjana halaman...","Click to abort":"Batal"},ExportDialog:{width:"40em",labelWidth:"12em",exportSettings:"Tetapan eksport",export:"Eksport",printSettings:"Tetapan Cetakan",print:"Cetak",exporterType:"Kawal penomboran",cancel:"Batal",fileFormat:"Format fail",rows:"Baris",alignRows:"Jajarkan baris",columns:"Kolum",paperFormat:"Format kertas",orientation:"Orientasi",repeatHeader:"Pengepala ulang"},ExportRowsCombo:{all:"Semua baris",visible:"Baris boleh lihat"},ExportOrientationCombo:{portrait:"Portret",landscape:"Landskap"},SinglePageExporter:{singlepage:"Halaman tunggal"},MultiPageExporter:{multipage:"Halaman pelbagai",exportingPage:({currentPage:a,totalPages:e})=>`Mengeksport halaman ${a}/${e}`},MultiPageVerticalExporter:{multipagevertical:"Halaman pelbagai (menegak)",exportingPage:({currentPage:a,totalPages:e})=>`Mengeksport halaman ${a}/${e}`},RowExpander:{loading:"Memuat",expand:"Kembang",collapse:"Kecil"},TreeGroup:{group:"Kumpulkan mengikut",stopGrouping:"Berhenti mengumpulkan",stopGroupingThisColumn:"Batalkan pengumpulan baris ini"}},B=u.publishLocale(C),E={localeName:"Ms",localeDesc:"Melayu",localeCode:"ms",Object:{newEvent:"Peristiwa baharu"},ResourceInfoColumn:{eventCountText:a=>a+" peristiwa"},Dependencies:{from:"Daripada",to:"Kepada",valid:"Sah",invalid:"Tidak sah"},DependencyType:{SS:"MM",SF:"MS",FS:"SM",FF:"SS",StartToStart:"Mula ke Mula",StartToEnd:"Mula ke Selesai",EndToStart:"Selesai ke Mula",EndToEnd:"Selesai ke Selesai",short:["MM","MS","SM","SS"],long:["Mula ke Mula","Mula ke Selesai","Selesai ke Mula","Selesai ke Selesai"]},DependencyEdit:{From:"Daripada",To:"Kepada",Type:"Jenis",Lag:"Sela","Edit dependency":"Edit kebergantungan",Save:"Simpan",Delete:"Hapus",Cancel:"Batal",StartToStart:"Mula ke Mula",StartToEnd:"Mula ke Akhir",EndToStart:"Akhir ke Mula",EndToEnd:"Akhir ke Akhir"},EventEdit:{Name:"Nama",Resource:"Sumber",Start:"Mula",End:"Akhir",Save:"Simpan",Delete:"Hapus",Cancel:"Batal","Edit event":"Edit peristiwa",Repeat:"Ulang"},EventDrag:{eventOverlapsExisting:"Peristiwa bertindih dengan peristiwa sedia ada untuk sumber ini",noDropOutsideTimeline:"Peristiwa tidak boleh digugurkan sepenuhnya di luar garis masa"},SchedulerBase:{"Add event":"Tambah peristiwa","Delete event":"Hapus peristiwa","Unassign event":"Nyahtetap peristiwa",color:"Warna"},TimeAxisHeaderMenu:{pickZoomLevel:"Zum",activeDateRange:"Julat tarikh",startText:"Tarikh mula",endText:"Tarikh akhir",todayText:"Hari ini"},EventCopyPaste:{copyEvent:"Salin peristiwa",cutEvent:"Potong peristiwa",pasteEvent:"Tampal peristiwa"},EventFilter:{filterEvents:"Tapis tugas",byName:"Ikut nama"},TimeRanges:{showCurrentTimeLine:"Tunjuk garis masa semasa"},PresetManager:{secondAndMinute:{displayDateFormat:"ll LTS",name:"Saat"},minuteAndHour:{topDateFormat:"ddd DD-MM, H",displayDateFormat:"ll LST"},hourAndDay:{topDateFormat:"ddd DD-MM",middleDateFormat:"LST",displayDateFormat:"ll LST",name:"Hari"},day:{name:"Hari/jam"},week:{name:"Minggu/jam"},dayAndWeek:{displayDateFormat:"ll LST",name:"Minggu/hari"},dayAndMonth:{name:"Bulan"},weekAndDay:{displayDateFormat:"ll LST",name:"Minggu"},weekAndMonth:{name:"Minggu"},weekAndDayLetter:{name:"Minggu/hari biasa"},weekDateAndMonth:{name:"Bulan/minggu"},monthAndYear:{name:"Bulan"},year:{name:"Tahun"},manyYears:{name:"Berbilang tahun"}},RecurrenceConfirmationPopup:{"delete-title":"Anda menghapuskan peristiwa","delete-all-message":"Adakah anda mahu menghapuskan semua kejadian peristiwa ini?","delete-further-message":"Adakah anda mahu menghapuskan ini dan semua kejadian masa hadapan peristiwa ini, atau hanya kejadian yang dipilih?","delete-further-btn-text":"Hapus Semua Peristiwa Masa Depan","delete-only-this-btn-text":"Padam Hanya Peristiwa Ini","update-title":"Anda mengubah peristiwa berulang","update-all-message":"Adakah anda mahu mengubah semua kejadian peristiwa ini?","update-further-message":"Adakah anda mahu menukar kejadian peristiwa ini sahaja, atau ini dan semua kejadian akan datang?","update-further-btn-text":"Semua Peristiwa Masa Depan","update-only-this-btn-text":"Hanya Peristiwa Ini",Yes:"Ya",Cancel:"Batal",width:600},RecurrenceLegend:{" and ":" dan ",Daily:"Harian","Weekly on {1}":({days:a})=>`Mingguan pada ${a}`,"Monthly on {1}":({days:a})=>`Bulanan pada ${a}`,"Yearly on {1} of {2}":({days:a,months:e})=>`Tahunan pada ${a} daripada ${e}`,"Every {0} days":({interval:a})=>`Setiap ${a} hari`,"Every {0} weeks on {1}":({interval:a,days:e})=>`Setiap ${a} minggu pada ${e}`,"Every {0} months on {1}":({interval:a,days:e})=>`Setiap ${a} bulan pada ${e}`,"Every {0} years on {1} of {2}":({interval:a,days:e,months:n})=>`Setiap ${a} tahun pada ${e} daripada ${n}`,position1:"pertama",position2:"kedua",position3:"ketiga",position4:"keempat",position5:"kelima","position-1":"terakhir",day:"hari",weekday:"hari minggu","weekend day":"hari hujung minggu",daysFormat:({position:a,days:e})=>`${a} ${e}`},RecurrenceEditor:{"Repeat event":"Peristiwa ulang",Cancel:"Batal",Save:"Simpan",Frequency:"Frekuensi",Every:"Setiap",DAILYintervalUnit:"hari",WEEKLYintervalUnit:"minggu",MONTHLYintervalUnit:"bulan",YEARLYintervalUnit:"tahun",Each:"Setiap","On the":"Pada","End repeat":"Akhir ulang","time(s)":"masa"},RecurrenceDaysCombo:{day:"hari",weekday:"hari minggu","weekend day":"hari hujung minggu"},RecurrencePositionsCombo:{position1:"pertama",position2:"kedua",position3:"ketiga",position4:"keempat",position5:"kelima","position-1":"terakhir"},RecurrenceStopConditionCombo:{Never:"Jangan",After:"Selepas","On date":"Pada tarikh"},RecurrenceFrequencyCombo:{None:"Tiada ulangan",Daily:"Harian",Weekly:"Mingguan",Monthly:"Bulanan",Yearly:"Tahunan"},RecurrenceCombo:{None:"Tiada",Custom:"Suaikan..."},Summary:{"Summary for":a=>`Ringkasan untuk ${a}`},ScheduleRangeCombo:{completeview:"Jadual lengkap",currentview:"Jadual boleh lihat",daterange:"Julat tarikh",completedata:"Jadual lengkap (untuk semua peristiwa)"},SchedulerExportDialog:{"Schedule range":"Julat jadual","Export from":"Daripada","Export to":"Kepada"},ExcelExporter:{"No resource assigned":"Tiada sumber diperuntukkan"},CrudManagerView:{serverResponseLabel:"Respons pelayan:"},DurationColumn:{Duration:"Tempoh"}},L=u.publishLocale(E),P={localeName:"Ms",localeDesc:"Melayu",localeCode:"ms",ConstraintTypePicker:{none:"Tiada",assoonaspossible:"Secepat mungkin",aslateaspossible:"Selewat-lewatnya",muststarton:"Mesti mula pada",mustfinishon:"Mesti selesai ada",startnoearlierthan:"Mula tidak awal daripada",startnolaterthan:"Mula tidak lewat daripada",finishnoearlierthan:"Selesai tidak awal daripada",finishnolaterthan:"Selesai tidak lewat daripada"},SchedulingDirectionPicker:{Forward:"Ke hadapan",Backward:"Ke belakang",inheritedFrom:"Diwarisi dari",enforcedBy:"Dikuatkuasakan oleh"},CalendarField:{"Default calendar":"Kalendar lalai"},TaskEditorBase:{Information:"Maklumat",Save:"Simpan",Cancel:"Batal",Delete:"Hapus",calculateMask:"Mengira...",saveError:"Tak boleh simpan, sila betulkan ralat dahulu",repeatingInfo:"Melihat acara berulang",editRepeating:"Edit"},TaskEdit:{editEvent:"Ubah peristiwa",ConfirmDeletionTitle:"Sahkan penghapusan",ConfirmDeletionMessage:"Adakah anda pasti mahu menghapuskan peristiwa?"},GanttTaskEditor:{editorWidth:"44em"},SchedulerTaskEditor:{editorWidth:"32em"},SchedulerGeneralTab:{labelWidth:"6em",General:"Umum",Name:"Nama",Resources:"Sumber","% complete":"% selesai",Duration:"Tempoh",Start:"Mula",Finish:"Selesai",Effort:"Usaha",Preamble:"Mukadimah",Postamble:"Pasca Mukadimah"},GeneralTab:{labelWidth:"6.5em",General:"Umum",Name:"Nama","% complete":"% selesai",Duration:"Tempoh",Start:"Mula",Finish:"Selesai",Effort:"Usaha",Dates:"Tarikh"},SchedulerAdvancedTab:{labelWidth:"13em",Advanced:"Lanjutan",Calendar:"Kalendar","Scheduling mode":"Mod Penjadualan","Effort driven":"Didorong usaha","Manually scheduled":"Dijadualkan secara manual","Constraint type":"Jenis kekang","Constraint date":"Tarikh kekang",Inactive:"Tidak aktif","Ignore resource calendar":"Abai kalendar sumber"},AdvancedTab:{labelWidth:"11.5em",Advanced:"Lanjutan",Calendar:"Kalendar","Scheduling mode":"Mod Penjadualan","Effort driven":"Didorong usaha","Manually scheduled":"Dijadualkan secara manual","Constraint type":"Jenis kekang","Constraint date":"Tarikh kekang",Constraint:"Kekang",Rollup:"Menggulung",Inactive:"Tidak aktif","Ignore resource calendar":"Abai kalendar sumber","Scheduling direction":"Arah jadual",projectBorder:"Sempadan projek",ignore:"Abai",honor:"Kehormatan",askUser:"Tanya pengguna"},DependencyTab:{Predecessors:"Pendahulu",Successors:"Pengganti",ID:"ID",Name:"Nama",Type:"Jenis",Lag:"Sela",cyclicDependency:"Kebergantungan kitaran",invalidDependency:"Kebergantungan tak sah"},NotesTab:{Notes:"Nota"},ResourcesTab:{unitsTpl:({value:a})=>`${a}%`,Resources:"Sumber",Resource:"Sumber",Units:"Unit"},RecurrenceTab:{title:"Ulang"},SchedulingModePicker:{Normal:"Normal","Fixed Duration":"Tempoh Tetap","Fixed Units":"Unit Tetap","Fixed Effort":"Usaha Tetap"},ResourceHistogram:{barTipInRange:'<b>{resource}</b> {startDate} - {endDate}<br><span class="{cls}">{allocated} daripada {available}</span> diperuntukkan',barTipOnDate:'<b>{resource}</b> on {startDate}<br><span class="{cls}">{allocated} daripada {available}</span> diperuntukkan',groupBarTipAssignment:'<b>{resource}</b> - <span class="{cls}">{allocated} daripada {available}</span>',groupBarTipInRange:'{startDate} - {endDate}<br><span class="{cls}">{allocated} daripada {available}</span> allocated:<br>{assignments}',groupBarTipOnDate:'Pada {startDate}<br><span class="{cls}">{allocated} daripada {available}</span> diperuntukkan:<br>{assignments}',plusMore:"+{value} lagi"},ResourceUtilization:{barTipInRange:'<b>{event}</b> {startDate} - {endDate}<br><span class="{cls}">{allocated}</span> diperuntukkan',barTipOnDate:'<b>{event}</b> pada {startDate}<br><span class="{cls}">{allocated}</span> diperuntukkan',groupBarTipAssignment:'<b>{event}</b> - <span class="{cls}">{allocated}</span>',groupBarTipInRange:'{startDate} - {endDate}<br><span class="{cls}">{allocated} daripada {available}</span> diperuntukkan:<br>{assignments}',groupBarTipOnDate:'Pada {startDate}<br><span class="{cls}">{allocated} daripada {available}</span> diperuntukkan:<br>{assignments}',plusMore:"+{value} lagi",nameColumnText:"Sumber / Peristiwa"},SchedulingIssueResolutionPopup:{"Cancel changes":"Batalkan perubahan dan jangan lakukan apa-apa",schedulingConflict:"Konflik penjadualan",emptyCalendar:"Ralat konfigurasi kalendar",cycle:"Kitaran penjadualan",Apply:"Guna"},CycleResolutionPopup:{dependencyLabel:"Sila pilih kebergantungan:",invalidDependencyLabel:"Terdapat kebergantungan tak sah yang terlibat yang perlu ditangani:"},DependencyEdit:{Active:"Aktif"},SchedulerProBase:{propagating:"Mengira projek",storePopulation:"Memuat data",finalizing:"Memuktamad keputusan"},EventSegments:{splitEvent:"Pecah acara",renameSegment:"Nama semula"},NestedEvents:{deNestingNotAllowed:"Menyahsarangan tak dibenarkan",nestingNotAllowed:"Sarangan tak dibenarkan"},VersionGrid:{compare:"Bandingkan",description:"Penerangan",occurredAt:"Berlaku pada",rename:"Tukar nama",restore:"Kembalikan",stopComparing:"Berhenti bandingkan"},Versions:{entityNames:{TaskModel:"tugas",AssignmentModel:"tugasan",DependencyModel:"pautan",ProjectModel:"projek",ResourceModel:"sumber",other:"objek"},entityNamesPlural:{TaskModel:"tugas",AssignmentModel:"tugasan",DependencyModel:"pautan",ProjectModel:"projek",ResourceModel:"sumber",other:"objek"},transactionDescriptions:{update:"Tukar {n} {entities}",add:"Tambah {n} {entities}",remove:"Buang {n} {entities}",move:"Alih {n} {entities}",mixed:"Tukar {n} {entities}"},addEntity:"Tambah {type} **{name}**",removeEntity:"Buang {type} **{name}**",updateEntity:"Tukar {type} **{name}**",moveEntity:"Alih {type} **{name}** from {from} to {to}",addDependency:"Tambah pautan daripada **{from}** sehingga **{to}**",removeDependency:"Buang pautan daripada **{from}** sehingga **{to}**",updateDependency:"Edit pautan daripada **{from}** sehingga **{to}**",addAssignment:"Tugaskan **{resource}** sehingga **{event}**",removeAssignment:"Buang tugasan **{resource}** daripada **{event}**",updateAssignment:"Edit tugasan **{resource}** sehingga **{event}**",noChanges:"Tiada perubahan",nullValue:"tiada",versionDateFormat:"M/D/YYYY h:mm a",undid:"Nyahbuat perubahan",redid:"Buat semula perubahan",editedTask:"Edit properti tugas",deletedTask:"Padam tugas",movedTask:"Alih satu tugas",movedTasks:"Alih tugas"}},F=u.publishLocale(P),w={localeName:"Ms",localeDesc:"Melayu",localeCode:"ms",Object:{Save:"Simpan"},IgnoreResourceCalendarColumn:{"Ignore resource calendar":"Abai kalendar sumber"},InactiveColumn:{Inactive:"Tak Aktif"},AddNewColumn:{"New Column":"Kolum Baharu"},BaselineStartDateColumn:{baselineStart:"Permulaan asal"},BaselineEndDateColumn:{baselineEnd:"Penghujung asal"},BaselineDurationColumn:{baselineDuration:"Tempoh asal"},BaselineStartVarianceColumn:{startVariance:"Varians mulakan"},BaselineEndVarianceColumn:{endVariance:"Tamat Varians"},BaselineDurationVarianceColumn:{durationVariance:"Varians Tempoh"},CalendarColumn:{Calendar:"Kalendar"},EarlyStartDateColumn:{"Early Start":"Mula Awal"},EarlyEndDateColumn:{"Early End":"Akhir Awal"},LateStartDateColumn:{"Late Start":"Mula Lambat"},LateEndDateColumn:{"Late End":"Akhir Lambat"},TotalSlackColumn:{"Total Slack":"Keseluruhan Slack"},ConstraintDateColumn:{"Constraint Date":"Tarikh Kekang"},ConstraintTypeColumn:{"Constraint Type":"Jenis Kekang"},DeadlineDateColumn:{Deadline:"Tarikh Akhir"},DependencyColumn:{"Invalid dependency":"Kebergantungan tak sah"},DurationColumn:{Duration:"Tempoh"},EffortColumn:{Effort:"Usaha"},EndDateColumn:{Finish:"Habis"},EventModeColumn:{"Event mode":"Mod peristiwa",Manual:"Manual",Auto:"Auto"},ManuallyScheduledColumn:{"Manually scheduled":"Dijadualkan secara manual"},MilestoneColumn:{Milestone:"Sorotan"},NameColumn:{Name:"Nama"},NoteColumn:{Note:"Nota"},PercentDoneColumn:{"% Done":"% Selesai"},PredecessorColumn:{Predecessors:"Pendahulu"},ResourceAssignmentColumn:{"Assigned Resources":"Sumber Diperuntukkan","more resources":"lagi sumber"},RollupColumn:{Rollup:"Menggulung"},SchedulingModeColumn:{"Scheduling Mode":"Mod Penjadualan"},SchedulingDirectionColumn:{schedulingDirection:"Arah Penjadualan",inheritedFrom:"Diwarisi dari",enforcedBy:"Dikuatkuasakan oleh"},SequenceColumn:{Sequence:"Urutan"},ShowInTimelineColumn:{"Show in timeline":"Tunjuk dalam garis masa"},StartDateColumn:{Start:"Mula"},SuccessorColumn:{Successors:"Pengganti"},TaskCopyPaste:{copyTask:"Salin",cutTask:"Potong",pasteTask:"Tampal"},WBSColumn:{WBS:"WBS",renumber:"Nombor semula"},DependencyField:{invalidDependencyFormat:"Format kebergantungan tak sah"},ProjectLines:{"Project Start":"Mula projek","Project End":"Akhir projek"},TaskTooltip:{Start:"Mula",End:"Akhir",Duration:"Tempoh",Complete:"Selesai"},AssignmentGrid:{Name:"Nama sumber",Units:"Unit",unitsTpl:({value:a})=>a?a+"%":""},Gantt:{Edit:"Edit",Indent:"Inden",Outdent:"Outden","Convert to milestone":"Tukar kepada sorotan",Add:"Tambah...","New task":"Tugas baru","New milestone":"Sorotan baharu","Task above":"Tugas atas","Task below":"Tugas bawah","Delete task":"Hapus",Milestone:"Sorotan","Sub-task":"Subtugas",Successor:"Pengganti",Predecessor:"Pendahulu",changeRejected:"Enjin penjadualan menolak perubahan",linkTasks:"Tambahkan kebergantungan",unlinkTasks:"Buang kebergantungan",color:"Warna"},EventSegments:{splitTask:"Pecah tugas"},Indicators:{earlyDates:"Mula/akhir awal",lateDates:"Mula/akhir lambat",Start:"Mula",End:"Akhir",deadlineDate:"Tarikh Akhir"},Versions:{indented:"Inden",outdented:"Luar inden",cut:"Potong",pasted:"Tampal",deletedTasks:"Padam tugas"}},j=u.publishLocale(w);if(typeof l.exports=="object"&&typeof d=="object"){var A=(a,e,n,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of Object.getOwnPropertyNames(e))!Object.prototype.hasOwnProperty.call(a,t)&&t!==n&&Object.defineProperty(a,t,{get:()=>e[t],enumerable:!(i=Object.getOwnPropertyDescriptor(e,t))||i.enumerable});return a};l.exports=A(l.exports,d)}return l.exports});