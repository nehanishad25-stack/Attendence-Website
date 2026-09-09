// ======================================
// ELEMENTS
// ======================================

const video = document.getElementById("video");

const startCameraBtn =
    document.getElementById("startCamera");

const stopCameraBtn =
    document.getElementById("stopCamera");

const cameraMessage =
    document.getElementById("cameraMessage");

const studentNameInput =
    document.getElementById("studentName");

const registerBtn =
    document.getElementById("registerBtn");

const registerMessage =
    document.getElementById("registerMessage");

const scanBtn =
    document.getElementById("scanBtn");

const scanMessage =
    document.getElementById("scanMessage");

const studentList =
    document.getElementById("studentList");

const searchStudent =
    document.getElementById("searchStudent");

const recentAttendance =
    document.getElementById("recentAttendance");

const registeredFaceCount =
    document.getElementById("registeredFaceCount");

const dailyTab =
    document.getElementById("dailyTab");

const monthlyTab =
    document.getElementById("monthlyTab");

const dailyReport =
    document.getElementById("dailyReport");

const monthlyReport =
    document.getElementById("monthlyReport");

const reportDate =
    document.getElementById("reportDate");

const reportMonth =
    document.getElementById("reportMonth");

const dailyTable =
    document.getElementById("dailyTable");

const monthlyTable =
    document.getElementById("monthlyTable");

const totalStudents =
    document.getElementById("totalStudents");

const presentStudents =
    document.getElementById("presentStudents");

const absentStudents =
    document.getElementById("absentStudents");

const leaveStudents =
    document.getElementById("leaveStudents");


// ======================================
// DATA
// ======================================

let students =
    JSON.parse(
        localStorage.getItem("students")
    ) || [];

let attendance =
    JSON.parse(
        localStorage.getItem("attendance")
    ) || [];

let cameraStream = null;

let faceModelsLoaded = false;


// ======================================
// DATE FUNCTIONS
// ======================================

function getToday() {

    const date = new Date();

    return (
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0")
    );
}


function getCurrentMonth() {

    const date = new Date();

    return (
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0")
    );
}


function formatDate(dateString) {

    const date =
        new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


// ======================================
// NAVIGATION
// ======================================

const navButtons =
    document.querySelectorAll(".nav-btn");

const pages =
    document.querySelectorAll(".page");


navButtons.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            navButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            this.classList.add("active");


            pages.forEach(page => {
                page.classList.remove("active");
            });


            const pageId =
                this.dataset.page;


            document
                .getElementById(pageId)
                .classList.add("active");


            if (pageId === "reports") {

                showDailyReport();

            }

        }
    );

});


// ======================================
// LOAD FACE AI MODELS
// ======================================

async function loadFaceModels() {

    try {

        scanMessage.innerText =
            "Loading Face AI...";


        const MODEL_URL =
            "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/model";


        await faceapi.nets.tinyFaceDetector
            .loadFromUri(MODEL_URL);


        await faceapi.nets.faceLandmark68Net
            .loadFromUri(MODEL_URL);


        await faceapi.nets.faceRecognitionNet
            .loadFromUri(MODEL_URL);


        faceModelsLoaded = true;


        scanMessage.innerText =
            "Face AI Ready ✓";


        console.log(
            "Face AI loaded successfully"
        );

    }

    catch (error) {

        console.error(
            "Face AI Error:",
            error
        );


        scanMessage.innerText =
            "Face AI load nahi hua. Internet check karo.";

    }

}


// ======================================
// CAMERA START
// ======================================

startCameraBtn.addEventListener(
    "click",
    async function () {

        try {

            if (!navigator.mediaDevices) {

                alert(
                    "Camera browser me available nahi hai."
                );

                return;
            }


            cameraStream =
                await navigator
                    .mediaDevices
                    .getUserMedia({
                        video: true,
                        audio: false
                    });


            video.srcObject =
                cameraStream;


            cameraMessage.style.display =
                "none";


            scanMessage.innerText =
                "Camera started ✓";

        }

        catch (error) {

            console.error(error);


            cameraMessage.style.display =
                "block";


            cameraMessage.innerText =
                "Camera permission denied";


            alert(
                "Camera permission Allow karo."
            );

        }

    }
);


// ======================================
// CAMERA STOP
// ======================================

stopCameraBtn.addEventListener(
    "click",
    function () {

        stopCamera();

    }
);


function stopCamera() {

    if (!cameraStream) {
        return;
    }


    cameraStream
        .getTracks()
        .forEach(track => {
            track.stop();
        });


    video.srcObject = null;

    cameraStream = null;


    cameraMessage.style.display =
        "block";


    cameraMessage.innerText =
        "Camera Off";


    scanMessage.innerText =
        "Camera stopped.";

}


// ======================================
// REGISTER STUDENT + FACE
// ======================================

registerBtn.addEventListener(
    "click",
    async function () {

        const name =
            studentNameInput.value.trim();


        // Name validation
        if (!name) {

            registerMessage.innerText =
                "Please enter student name.";

            registerMessage.style.color =
                "red";

            return;
        }


        // Camera validation
        if (!cameraStream) {

            registerMessage.innerText =
                "First start camera.";

            registerMessage.style.color =
                "red";

            return;
        }


        // Model validation
        if (!faceModelsLoaded) {

            registerMessage.innerText =
                "Face AI abhi load ho raha hai.";

            registerMessage.style.color =
                "red";

            return;
        }


        registerMessage.innerText =
            "Face scanning...";

        registerMessage.style.color =
            "#4169e1";


        try {

            // Detect face
            const detection =
                await faceapi
                    .detectSingleFace(
                        video,
                        new faceapi.TinyFaceDetectorOptions()
                    )
                    .withFaceLandmarks()
                    .withFaceDescriptor();


            // Face not found
            if (!detection) {

                registerMessage.innerText =
                    "Face nahi mila. Camera ki taraf dekho.";

                registerMessage.style.color =
                    "red";

                return;
            }


            // Duplicate name check
            const alreadyExists =
                students.some(
                    student =>
                        student.name.toLowerCase() ===
                        name.toLowerCase()
                );


            if (alreadyExists) {

                registerMessage.innerText =
                    "Ye student already registered hai.";

                registerMessage.style.color =
                    "red";

                return;
            }


            // Current face
            const newFace =
                detection.descriptor;


            // Check whether this face already belongs
            // to another registered student
            const sameFaceStudent =
                findMatchingStudent(newFace);


            if (sameFaceStudent) {

                registerMessage.innerText =
                    `Ye face already ${sameFaceStudent.name} ke naam se registered hai.`;

                registerMessage.style.color =
                    "red";

                return;
            }


            // Convert descriptor to normal array
            const faceData =
                Array.from(newFace);


            // Student object
            const student = {

                id: Date.now(),

                name: name,

                faceData: faceData

            };


            // Save student
            students.push(student);


            localStorage.setItem(
                "students",
                JSON.stringify(students)
            );


            studentNameInput.value = "";


            registerMessage.innerText =
                `${name} + face successfully registered ✓`;

            registerMessage.style.color =
                "#20b26b";


            displayStudents();

            updateDashboard();

            updateRegisteredFaceCount();

        }

        catch (error) {

            console.error(
                "Registration error:",
                error
            );


            registerMessage.innerText =
                "Face registration failed.";

            registerMessage.style.color =
                "red";

        }

    }
);


// ======================================
// FIND MATCHING STUDENT
// ======================================

function findMatchingStudent(
    currentFace,
    ignoreStudentId = null
) {

    let bestStudent = null;

    let bestDistance = Infinity;


    students.forEach(student => {

        if (!student.faceData) {
            return;
        }


        if (
            ignoreStudentId !== null &&
            student.id == ignoreStudentId
        ) {
            return;
        }


        const savedFace =
            new Float32Array(
                student.faceData
            );


        const distance =
            faceapi.euclideanDistance(
                savedFace,
                currentFace
            );


        if (distance < bestDistance) {

            bestDistance =
                distance;

            bestStudent =
                student;

        }

    });


    // 0.5 is our matching threshold
    if (
        bestStudent &&
        bestDistance <= 0.5
    ) {

        return bestStudent;

    }


    return null;

}


// ======================================
// AUTOMATIC FACE ATTENDANCE
// ======================================

scanBtn.addEventListener(
    "click",
    async function () {

        // Students check
        if (students.length === 0) {

            scanMessage.innerText =
                "Pehle students register karo.";

            scanMessage.style.color =
                "red";

            return;
        }


        // Camera check
        if (!cameraStream) {

            scanMessage.innerText =
                "First start camera.";

            scanMessage.style.color =
                "red";

            return;
        }


        // AI check
        if (!faceModelsLoaded) {

            scanMessage.innerText =
                "Face AI ready nahi hai.";

            scanMessage.style.color =
                "red";

            return;
        }


        scanMessage.innerText =
            "Checking your face...";

        scanMessage.style.color =
            "#4169e1";


        try {

            const detection =
                await faceapi
                    .detectSingleFace(
                        video,
                        new faceapi.TinyFaceDetectorOptions()
                    )
                    .withFaceLandmarks()
                    .withFaceDescriptor();


            // No face
            if (!detection) {

                scanMessage.innerText =
                    "❌ Face nahi mila.";

                scanMessage.style.color =
                    "red";

                return;
            }


            const currentFace =
                detection.descriptor;


            // Search all registered faces
            const student =
                findMatchingStudent(
                    currentFace
                );


            // Wrong / unknown face
            if (!student) {

                scanMessage.innerText =
                    "❌ Wrong Face! Registered student nahi mila.";

                scanMessage.style.color =
                    "red";

                return;
            }


            console.log(
                "Matched student:",
                student.name
            );


            // Today's date
            const today =
                getToday();


            // Check duplicate attendance
            const alreadyPresent =
                attendance.some(
                    record =>
                        record.studentId == student.id &&
                        record.date === today
                );


            if (alreadyPresent) {

                scanMessage.innerText =
                    `⚠️ ${student.name} already Present today.`;

                scanMessage.style.color =
                    "#e67e22";

                return;
            }


            // Current time
            const now =
                new Date();


            // Attendance record
            const record = {

                id: Date.now(),

                studentId:
                    student.id,

                name:
                    student.name,

                date:
                    today,

                time:
                    now.toLocaleTimeString(
                        "en-IN"
                    ),

                status:
                    "Present"

            };


            // Save attendance
            attendance.push(record);


            localStorage.setItem(
                "attendance",
                JSON.stringify(attendance)
            );


            scanMessage.innerText =
                `✓ ${student.name} Present`;

            scanMessage.style.color =
                "#20b26b";


            updateDashboard();

            displayRecentAttendance();

            showDailyReport();

        }

        catch (error) {

            console.error(
                "Scan error:",
                error
            );


            scanMessage.innerText =
                "Face scanning failed.";

            scanMessage.style.color =
                "red";

        }

    }
);


// ======================================
// DASHBOARD
// ======================================
// ======================================
// DASHBOARD
// ======================================

function updateDashboard() {

    const today = getToday();

    // Aaj ki attendance
    const todayAttendance = attendance.filter(
        record => record.date === today
    );

    // Ek student ko sirf 1 baar count karo
    const presentStudents = new Set(
        todayAttendance.map(
            record => String(record.studentId)
        )
    );

    const present = presentStudents.size;

    const total = students.length;

    const absent = Math.max(
        total - present,
        0
    );

    let percentage = 0;

    if (total > 0) {
        percentage = Math.round(
            (present / total) * 100
        );
    }

    document.getElementById(
        "totalStudents"
    ).innerText = total;

    document.getElementById(
        "presentStudents"
    ).innerText = present;

    document.getElementById(
        "absentStudents"
    ).innerText = absent;

    document.getElementById(
        "todayDate"
    ).innerText =
        new Date().toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

    document.getElementById(
        "attendancePercent"
    ).innerText = percentage + "%";

    document.getElementById(
        "progressBar"
    ).style.width = percentage + "%";
}
// ======================================
// DISPLAY STUDENTS
// ======================================

function displayStudents(search = "") {

    studentList.innerHTML = "";

    


    const filtered =
        students.filter(
            student =>
                student.name
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    )
        );


    if (filtered.length === 0) {

        studentList.innerHTML =
            "<p>No students found.</p>";

        return;

    }


    filtered.forEach(student => {

        const item =
            document.createElement("div");


        item.className =
            "student-item";


        const faceStatus =
            student.faceData
                ? `<span class="registered">
                    Face Registered ✓
                   </span>`
                : `<span class="not-registered">
                    Face Not Registered
                   </span>`;


        item.innerHTML = `

    <div class="student-name">

        <strong>
            👤 ${student.name}
        </strong>

        ${faceStatus}

    </div>


    <div class="student-actions">

        <button
            class="edit-btn"
            onclick="editStudent(${student.id})">

            ✏️ Edit

        </button>


        <button
            class="delete-btn"
            onclick="deleteStudent(${student.id})">

            🗑️ Delete

        </button>


        <button
            class="primary-btn"
            onclick="markLeave(${student.id})">

            📅 Leave

        </button>

    </div>

`;


        studentList.appendChild(item);

    });

}


// ======================================
// EDIT STUDENT
// ======================================

function editStudent(id) {

    const student =
        students.find(
            student =>
                student.id === id
        );


    if (!student) {
        return;
    }


    const newName =
        prompt(
            "Enter new student name:",
            student.name
        );


    if (newName === null) {
        return;
    }


    const updatedName =
        newName.trim();


    if (!updatedName) {

        alert(
            "Name cannot be empty."
        );

        return;
    }


    const alreadyExists =
        students.some(
            s =>
                s.id !== id &&
                s.name.toLowerCase() ===
                updatedName.toLowerCase()
        );


    if (alreadyExists) {

        alert(
            "This student name already exists."
        );

        return;
    }


    const oldName =
        student.name;


    student.name =
        updatedName;


    // Update old attendance names
    attendance.forEach(record => {

        if (
            record.studentId === id
        ) {

            record.name =
                updatedName;

        }

    });


    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );


    localStorage.setItem(
        "attendance",
        JSON.stringify(attendance)
    );


    displayStudents(
        searchStudent.value
    );


    displayRecentAttendance();

    updateDashboard();

    showDailyReport();


    alert(
        `${oldName} → ${updatedName} successfully updated ✓`
    );

}


// ======================================
// DELETE STUDENT
// ======================================

function deleteStudent(id) {

    const student =
        students.find(
            student =>
                student.id === id
        );


    if (!student) {
        return;
    }


    const confirmDelete =
        confirm(
            `Are you sure you want to delete ${student.name}?`
        );


    if (!confirmDelete) {
        return;
    }


    students =
        students.filter(
            student =>
                student.id !== id
        );


    attendance =
        attendance.filter(
            record =>
                record.studentId !== id
        );


    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );


    localStorage.setItem(
        "attendance",
        JSON.stringify(attendance)
    );


    displayStudents(
        searchStudent.value
    );


    displayRecentAttendance();

    updateDashboard();

    updateRegisteredFaceCount();

    showDailyReport();


    alert(
        `${student.name} deleted successfully ✓`
    );

}

function markLeave(studentId) {
    const student = students.find(s => s.id === studentId);

    if (!student) {
        alert("Student not found!");
        return;
    }

    student.status = "Leave";

    saveStudents();
    renderStudents();
}


// ======================================
// SEARCH
// ======================================

searchStudent.addEventListener(
    "input",
    function () {

        displayStudents(
            this.value
        );

    }
);


// ======================================
// RECENT ATTENDANCE
// ======================================

function displayRecentAttendance() {

    recentAttendance.innerHTML =
        "";


    const recent =
        attendance
            .slice()
            .reverse()
            .slice(0, 5);


    if (recent.length === 0) {

        recentAttendance.innerHTML =
            "<p>No attendance yet.</p>";

        return;
    }


    recent.forEach(record => {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "recent-item";


        item.innerHTML = `

            <strong>
                ${record.name}
            </strong>

            <span>
                ${formatDate(record.date)}
                ${record.time}
            </span>

        `;


        recentAttendance.appendChild(
            item
        );

    });

}


// ======================================
// REGISTERED FACE COUNT
// ======================================

function updateRegisteredFaceCount() {

    const count =
        students.filter(
            student =>
                student.faceData
        ).length;


    registeredFaceCount.innerText =
        count;

}


// ======================================
// DAILY / MONTHLY TABS
// ======================================

dailyTab.addEventListener(
    "click",
    function () {

        dailyTab.classList.add(
            "active"
        );

        monthlyTab.classList.remove(
            "active"
        );


        dailyReport.classList.remove(
            "hidden"
        );

        monthlyReport.classList.add(
            "hidden"
        );


        showDailyReport();

    }
);


monthlyTab.addEventListener(
    "click",
    function () {

        monthlyTab.classList.add(
            "active"
        );

        dailyTab.classList.remove(
            "active"
        );


        monthlyReport.classList.remove(
            "hidden"
        );

        dailyReport.classList.add(
            "hidden"
        );


        showMonthlyReport();

    }
);


// ======================================
// REPORT DATE
// ======================================

reportDate.value =
    getToday();


reportMonth.value =
    getCurrentMonth();


reportDate.addEventListener(
    "change",
    showDailyReport
);


reportMonth.addEventListener(
    "change",
    showMonthlyReport
);


// ======================================
// DAILY REPORT
// ======================================

function showDailyReport() {

    const selectedDate =
        reportDate.value ||
        getToday();


    dailyTable.innerHTML =
        "";


    const presentRecords =
        attendance.filter(
            record =>
                record.date === selectedDate
        );


    const presentIds =
        new Set(
            presentRecords.map(
                record =>
                    String(record.studentId)
            )
        );


    const total =
        students.length;


    const present =
        presentRecords.length;


    const absent =
        Math.max(
            total - present,
            0
        );


    document.getElementById(
        "dailyTotal"
    ).innerText =
        total;


    document.getElementById(
        "dailyPresent"
    ).innerText =
        present;


    document.getElementById(
        "dailyAbsent"
    ).innerText =
        absent;


    if (students.length === 0) {

        dailyTable.innerHTML = `
            <tr>
                <td colspan="3">
                    No students registered.
                </td>
            </tr>
        `;

        return;
    }


    students.forEach(student => {

        const record =
            presentRecords.find(
                item =>
                    String(
                        item.studentId
                    ) ===
                    String(
                        student.id
                    )
            );


        const row =
            document.createElement(
                "tr"
            );


        if (
            presentIds.has(
                String(student.id)
            )
        ) {

            row.innerHTML = `

                <td>${student.name}</td>

                <td>${record.time}</td>

                <td class="present-status">
                    Present ✓
                </td>

            `;

        }

        else {

            row.innerHTML = `

                <td>${student.name}</td>

                <td>-</td>

                <td class="absent-status">
                    Absent
                </td>

            `;

        }


        dailyTable.appendChild(
            row
        );

    });

}


// ======================================
// MONTHLY REPORT
// ======================================

function showMonthlyReport() {

    const selectedMonth =
        reportMonth.value ||
        getCurrentMonth();


    monthlyTable.innerHTML =
        "";


    if (students.length === 0) {

        monthlyTable.innerHTML = `
            <tr>
                <td colspan="4">
                    No students registered.
                </td>
            </tr>
        `;

        return;
    }


    /*
       We count the number of unique dates
       for which attendance exists.
    */

    const monthRecords =
        attendance.filter(
            record =>
                record.date.startsWith(
                    selectedMonth
                )
        );


    const uniqueDates =
        [
            ...new Set(
                monthRecords.map(
                    record =>
                        record.date
                )
            )
        ];


    const attendanceDays =
        uniqueDates.length;


    students.forEach(student => {

        const present =
            monthRecords.filter(
                record =>
                    String(
                        record.studentId
                    ) ===
                    String(
                        student.id
                    )
            ).length;


        const absent =
            Math.max(
                attendanceDays - present,
                0
            );


        let percentage = 0;


        if (attendanceDays > 0) {

            percentage =
                Math.round(
                    (
                        present /
                        attendanceDays
                    ) * 100
                );

        }


        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML = `

            <td>
                ${student.name}
            </td>

            <td class="present-status">
                ${present}
            </td>

            <td class="absent-status">
                ${absent}
            </td>

            <td>
                ${percentage}%
            </td>

        `;


        monthlyTable.appendChild(
            row
        );

    });

}


// ====================================== 
// INITIALIZE 
// ====================================== 

async function init() {

    updateDashboard();

    displayStudents();

    displayRecentAttendance();

    updateRegisteredFaceCount();

    reportDate.value =
        getToday();

    reportMonth.value =
        getCurrentMonth();

    showDailyReport();

    await loadFaceModels();

}


init();