require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer'); // O puedes usar EmailJS SDK para Node

const app = express();
app.use(express.json());

app.post('/api/agendar-asesoria', async (req, res) => {
    const { nombre, email, fecha, hora } = req.body;

    // Configura el transporter usando variables de entorno (protegidas con secrets en producción)
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Ejemplo con Gmail, puedes usar cualquier SMTP
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_RECEIVER, // Tu correo personal
        subject: 'Nueva asesoría legal agendada',
        text: `
            Nombre: ${nombre}
            Email: ${email}
            Fecha: ${fecha}
            Hora: ${hora}
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Reserva enviada correctamente.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al enviar el correo.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
