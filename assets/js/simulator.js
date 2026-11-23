(function () {
  const DATA = [
    {
      subtitle: 'Flujo: Captura de Leads (Reels)',
      initial: [
        { sender: 'system', text: 'Comentaste "GUÍA" en el Reel de @academia.creadores' },
        { sender: 'bot', text: '¡Hola! 🙌 Te envío la Guía PDF con los 7 pasos para estructurar tu primer curso online. ¿A qué correo te la mando también como respaldo?' }
      ],
      replies: [
        {
          label: 'mi.correo@gmail.com', userText: 'mi.correo@gmail.com',
          bot: '¡Listo! ✅ Guía enviada a tu bandeja. ¿Te gustaría ver el temario completo de nuestra Academia?',
          next: [{ label: 'Sí, ver el temario 📚', userText: 'Sí, ver el temario 📚', bot: '¡Genial! Son 6 módulos prácticos + mentorías semanales.', next: [] }]
        },
        { label: 'Solo pásame el link 🔗', userText: 'Solo pásame el link 🔗', bot: '¡Por supuesto! academia.creadores/guia-gratis 🚀', next: [] }
      ]
    },
    {
      subtitle: 'Flujo: Registro a Webinar en Vivo',
      initial: [
        { sender: 'system', text: 'Respondiste "CLASE" a una Historia' },
        { sender: 'bot', text: '¡Bienvenido! 🎥 Este jueves a las 7:00 PM daré la clase gratuita. ¿Te reservo un cupo?' }
      ],
      replies: [
        {
          label: '¡Sí, reservar! 🎟️', userText: '¡Sí, reservar! 🎟️',
          bot: '¡Cupo confirmado! 🎉 Te enviaré un recordatorio por aquí 15 minutos antes.',
          next: [{ label: 'Añadir al calendario 📅', userText: 'Añadir al calendario 📅', bot: 'Evento guardado ✅', next: [] }]
        },
        { label: '¿Quedará grabada? 🤔', userText: '¿Quedará grabada? 🤔', bot: 'Solo 24 horas para inscritos. ¡Asegura tu lugar!', next: [] }
      ]
    },
    {
      subtitle: 'Flujo: Quiz Calificador',
      initial: [
        { sender: 'bot', text: '¡Hola! 👋 ¿En qué etapa estás con tu curso online?' }
      ],
      replies: [
        {
          label: 'Aún no tengo curso 🌱', userText: 'Aún no tengo curso 🌱',
          bot: '¡Perfecto! El programa "Cero a Primer Alumno" valida tu idea antes de grabarla. ¿Ver cómo funciona?',
          next: [{ label: 'Ver programa 🚀', userText: 'Ver programa 🚀', bot: 'academia.creadores/inicio 🎁', next: [] }]
        },
        { label: 'Ya vendo, quiero escalar 📈', userText: 'Ya vendo, quiero escalar 📈', bot: 'Recomendamos la "Mentoría Evergreen Pro". Te envío detalles:', next: [] }
      ]
    },
    {
      subtitle: 'Flujo: Recuperación de Carrito',
      initial: [
        { sender: 'system', text: 'Usuario visitó checkout hace 45 min' },
        { sender: 'bot', text: '¡Hola! Vi que estuviste a un paso de unirte 👀 ¿Alguna duda sobre el acceso o métodos de pago?' }
      ],
      replies: [
        {
          label: '¿Pago en cuotas? 💳', userText: '¿Pago en cuotas? 💳',
          bot: '¡Sí! Hasta 6 cuotas sin interés, 14 días de garantía. ¿Te paso el enlace?',
          next: [{ label: 'Sí, enviarme link ✅', userText: 'Sí, enviarme link ✅', bot: 'academia.creadores/checkout-cuotas 🎉', next: [] }]
        },
        { label: '¿Acceso de por vida? ♾️', userText: '¿Acceso de por vida? ♾️', bot: 'Así es, acceso ilimitado de por vida.', next: [] }
      ]
    }
  ];

  let active = 0;
  const esc = (s) => { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; };

  function append(sender, text) {
    const stream = document.getElementById('sim-chat-stream');
    if (!stream) return;
    const wrap = document.createElement('div');
    if (sender === 'system') {
      wrap.className = 'chat-system';
      wrap.innerHTML = `<span>${esc(text)}</span>`;
    } else if (sender === 'bot') {
      wrap.className = 'chat-row';
      wrap.innerHTML = `<div class="chat-avatar">AC</div><div class="chat-bubble chat-bubble--bot">${esc(text)}</div>`;
    } else {
      wrap.className = 'chat-row chat-row--user';
      wrap.innerHTML = `<div class="chat-bubble chat-bubble--user">${esc(text)}</div>`;
    }
    stream.appendChild(wrap);
    stream.scrollTop = stream.scrollHeight;
  }

  function render(replies) {
    const c = document.getElementById('sim-quick-replies');
    if (!c) return;
    c.innerHTML = '';
    if (!replies || !replies.length) {
      const b = document.createElement('button');
      b.className = 'quick-reply quick-reply--muted';
      b.textContent = '↺ Reiniciar flujo';
      b.addEventListener('click', reset);
      c.appendChild(b);
      return;
    }
    replies.forEach(r => {
      const b = document.createElement('button');
      b.className = 'quick-reply';
      b.textContent = r.label;
      b.addEventListener('click', () => {
        append('user', r.userText);
        c.innerHTML = '<span class="chat-typing">Escribiendo respuesta...</span>';
        setTimeout(() => { append('bot', r.bot); render(r.next); }, 480);
      });
      c.appendChild(b);
    });
  }

  function reset() {
    const d = DATA[active];
    const sub = document.getElementById('sim-subtitle');
    if (sub) sub.textContent = d.subtitle;
    const s = document.getElementById('sim-chat-stream');
    if (s) s.innerHTML = '';
    d.initial.forEach(m => append(m.sender, m.text));
    render(d.replies);
  }

  function init() {
    document.querySelectorAll('input[name="uc"]').forEach((r, i) => {
      r.addEventListener('change', () => { if (r.checked) { active = i; reset(); } });
    });
    document.querySelectorAll('[data-reset-sim]').forEach(b => b.addEventListener('click', reset));
    reset();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();