document.addEventListener("DOMContentLoaded", loadSettings);

document
    .getElementById("saveBtn")
    .addEventListener("click", saveSettingsPage);

async function loadSettings() {

    const result = await apiGetSettings();

    if (!result.success) {

        showToast("Unable to load settings", "error");

        return;

    }

    const settings = result.data;

    document.getElementById("pushNotification").checked =
        settings.pushNotification;

    document.getElementById("whatsappReminder").checked =
        settings.whatsappReminder;

    document.getElementById("reminderAfter").value =
        settings.reminderAfter;

    document.getElementById("repeatEvery").value =
        settings.repeatEvery;

}

async function saveSettingsPage() {

    const settings = {

        pushNotification:
            document.getElementById("pushNotification").checked,

        whatsappReminder:
            document.getElementById("whatsappReminder").checked,

        reminderAfter:
            document.getElementById("reminderAfter").value,

        repeatEvery:
            document.getElementById("repeatEvery").value

    };

    const result = await apiSaveSettings(settings);

    if (result.success) {

        showToast("✅ Settings Saved");

    }

    else {

        showToast("❌ Save Failed", "error");

    }

}
async function testWhatsApp() {

    const phone = prompt(

        "Enter WhatsApp Number\nExample: 919876543210"

    );

    if (!phone) return;

    const result = await fetch(

        "http://localhost:8000/api/whatsapp/send",

        {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                phone,

                message:
`🔥 RoomSplit Test

Congratulations!

WhatsApp Cloud API Connected Successfully.`

            })

        }

    );

    const data = await result.json();

    if (data.success) {

        alert("✅ WhatsApp Sent");

    }

    else {

        alert(data.error);

    }

}