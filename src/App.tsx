import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, CircleHelp, History, Home, Mic, Plus, Search, Settings, ShoppingBasket, Sparkles, Trash2, X } from 'lucide-react'
import { categoryIcons, categoryLabels, classifyName, findProduct, products } from './data'
import { parseCommand } from './parser'
import { getSuggestions } from './recommendations'
import type { Category, Language, ShoppingItem, Unit } from './types'

const listKey = 'voice-shopper:list'
const historyKey = 'voice-shopper:history'
const languageKey = 'voice-shopper:language'
const read = <T,>(key: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback)) as T } catch { return fallback } }
const now = () => new Date().toISOString()
const normalize = (value: string) => value.toLowerCase().replace(/s$/, '').trim()
const ageLabel = (date: string) => { const days = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000)); return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago` }
const readList = (): ShoppingItem[] => read<ShoppingItem[]>(listKey, []).map((item) => ({ ...item, category: classifyName(item.name) }))
const copy = {
  'en-US': { assistant: 'YOUR SHOPPING ASSISTANT', title: 'What are we', titleAccent: 'picking up?', prompt: 'Tap the microphone and tell me what you need.', ready: 'Ready when you are', transcript: 'Your words will appear here', tap: 'Tap to talk', listening: 'Listening...', understanding: 'Understanding...', input: 'Or type what you need...', list: 'Shopping list', run: 'THE RUN', clear: 'Clear list', basket: 'For your basket', nudge: 'A LITTLE NUDGE', settings: 'Assistant settings', local: 'Speech is transcribed securely by Hugging Face.', clearData: 'Clear local data', home: 'Home', history: 'History', voice: 'Voice', search: 'Search', profile: 'Profile', footer: 'LOCAL CATALOGUE · HUGGING FACE VOICE', quick: ['Add milk', 'Add 2 bottles of water', 'Find toothpaste under $5'] },
  'hi-IN': { assistant: 'आपका खरीदारी सहायक', title: 'हम क्या', titleAccent: 'खरीदें?', prompt: 'माइक्रोफ़ोन दबाकर बताएं कि आपको क्या चाहिए।', ready: 'जब आप तैयार हों', transcript: 'आपकी आवाज़ यहां दिखाई देगी', tap: 'बोलने के लिए दबाएं', listening: 'सुन रहा है...', understanding: 'समझ रहा है...', input: 'या अपनी ज़रूरत लिखें...', list: 'खरीदारी सूची', run: 'आपकी सूची', clear: 'सूची साफ़ करें', basket: 'आपकी टोकरी के लिए', nudge: 'एक सुझाव', settings: 'सहायक सेटिंग्स', local: 'आवाज़ Hugging Face द्वारा ट्रांसक्राइब की जाती है।', clearData: 'स्थानीय डेटा साफ़ करें', home: 'होम', history: 'इतिहास', voice: 'आवाज़', search: 'खोजें', profile: 'प्रोफ़ाइल', footer: 'स्थानीय कैटलॉग · HUGGING FACE VOICE', quick: ['दूध जोड़ें', '2 बोतल पानी जोड़ें', 'टूथपेस्ट खोजें'] },
  'es-ES': { assistant: 'TU ASISTENTE DE COMPRAS', title: '¿Qué vamos a', titleAccent: 'comprar?', prompt: 'Toca el micrófono y dime qué necesitas.', ready: 'Listo cuando quieras', transcript: 'Tus palabras aparecerán aquí', tap: 'Toca para hablar', listening: 'Escuchando...', understanding: 'Entendiendo...', input: 'O escribe lo que necesitas...', list: 'Lista de compras', run: 'TU LISTA', clear: 'Vaciar lista', basket: 'Para tu cesta', nudge: 'UNA SUGERENCIA', settings: 'Ajustes del asistente', local: 'La voz se transcribe con Hugging Face.', clearData: 'Borrar datos locales', home: 'Inicio', history: 'Historial', voice: 'Voz', search: 'Buscar', profile: 'Perfil', footer: 'CATÁLOGO LOCAL · VOZ HUGGING FACE', quick: ['Añadir leche', 'Añadir 2 botellas de agua', 'Buscar pasta de dientes'] },
} as const

const createWav = (samples: Float32Array, sampleRate: number) => {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)
  const writeText = (offset: number, value: string) => value.split('').forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)))
  writeText(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeText(8, 'WAVE')
  writeText(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeText(36, 'data')
  view.setUint32(40, samples.length * 2, true)
  samples.forEach((sample, index) => view.setInt16(44 + index * 2, Math.max(-1, Math.min(1, sample)) * 0x7fff, true))
  return new Blob([buffer], { type: 'audio/wav' })
}

const transcribeWithHuggingFace = async (audio: Blob) => {
  const token = import.meta.env.VITE_HUGGINGFACE_API_KEY
  if (!token) throw new Error('Missing VITE_HUGGINGFACE_API_KEY in the environment.')
  const response = await fetch('https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3-turbo', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'audio/wav' },
    body: audio,
  })
  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Hugging Face API returned ${response.status}${details ? `: ${details}` : ''}`)
  }
  const result = await response.json() as { text?: string }
  return result.text ?? ''
}

function App() {
  const [list, setList] = useState<ShoppingItem[]>(readList)
  const [history, setHistory] = useState<{ productName: string; category: Category; quantity: number; purchasedAt: string }[]>(() => read(historyKey, []))
  const [input, setInput] = useState('')
  const [transcript, setTranscript] = useState('')
  const [status, setStatus] = useState('Ready when you are')
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'processing' | 'error'>('idle')
  const [language, setLanguage] = useState<Language>(() => read<Language>(languageKey, 'en-US'))
  const [searchResults, setSearchResults] = useState<typeof products>([])
  const [searchLabel, setSearchLabel] = useState('')
  const [showQuickCommands, setShowQuickCommands] = useState(false)
  const [removedItem, setRemovedItem] = useState<ShoppingItem | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const stopRecording = useRef<(() => void) | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const historyRef = useRef<HTMLElement>(null)
  const text = copy[language]
  const categoryText: Record<Category, string> = language === 'hi-IN'
    ? { dairy: 'डेयरी', fruits: 'फल', vegetables: 'सब्ज़ियां', grains: 'अनाज और मुख्य खाद्य', spices: 'मसाले', cooking: 'खाना पकाने की सामग्री', 'bakery-snacks': 'बेकरी और स्नैक्स', 'meat-protein': 'मांस, प्रोटीन और अन्य', other: 'अन्य' }
    : language === 'es-ES'
      ? { dairy: 'Lácteos', fruits: 'Frutas', vegetables: 'Verduras', grains: 'Granos y básicos', spices: 'Especias', cooking: 'Esenciales de cocina', 'bakery-snacks': 'Panadería y snacks', 'meat-protein': 'Carne, proteínas y otros', other: 'Otros' }
      : categoryLabels

  useEffect(() => { localStorage.setItem(listKey, JSON.stringify(list)) }, [list])
  useEffect(() => { localStorage.setItem(historyKey, JSON.stringify(history)) }, [history])
  useEffect(() => { localStorage.setItem(languageKey, JSON.stringify(language)) }, [language])

  const suggestions = useMemo(() => getSuggestions(history, list), [history, list])
  const activeCount = list.filter((item) => !item.completed).length
  const categories = [...new Set(list.map((item) => item.category))]
  const searchFilters = searchLabel.match(/(?:under|below|less than|menos de)\s*[₹$]?\s*\d+(?:\.\d+)?/i)?.[0]
  const recentHistory = history.slice(-4).reverse()
  const resultSubstitutes = [...new Map(searchResults.flatMap((product) => product.substituteIds.map((id) => products.find((candidate) => candidate.id === id))).filter((product): product is typeof products[number] => Boolean(product)).map((product) => [product.id, product])).values()]

  const addItem = (name: string, quantity = 1, unit: Unit = 'item') => {
    const product = findProduct(name)
    const normalizedName = normalize(product?.name ?? name)
    const category = product?.category ?? classifyName(name)
    setList((current) => {
      const existing = current.find((item) => item.normalizedName === normalizedName && !item.completed)
      if (existing) return current.map((item) => item.id === existing.id ? { ...item, quantity: item.quantity + quantity, unit, updatedAt: now() } : item)
      return [...current, { id: crypto.randomUUID(), name: product?.name ?? name.trim(), normalizedName, quantity, unit, category, completed: false, createdAt: now(), updatedAt: now() }]
    })
    setHistory((current) => [...current, { productName: normalizedName, category, quantity, purchasedAt: now() }])
    setStatus(`${language === 'hi-IN' ? 'जोड़ा गया' : language === 'es-ES' ? 'Añadido' : 'Added'} ${quantity > 1 ? `${quantity} ` : ''}${unit !== 'item' ? `${unit}${quantity > 1 ? 's' : ''} of ` : ''}${product?.name ?? name}`)
  }
  const removeItem = (name: string) => { const match = list.find((item) => item.normalizedName === normalize(name) || item.name.toLowerCase().includes(name.toLowerCase())); if (!match) return setStatus(language === 'hi-IN' ? `${name} सूची में नहीं मिला` : language === 'es-ES' ? `No encontré ${name} en tu lista` : `I couldn't find ${name} on your list`); setRemovedItem(match); setList((current) => current.filter((item) => item.id !== match.id)); setStatus(`${language === 'hi-IN' ? 'हटाया गया' : language === 'es-ES' ? 'Eliminado' : 'Removed'} ${match.name}`) }
  const undoRemove = () => { if (!removedItem) return; setList((current) => [...current, removedItem]); setStatus(`${language === 'hi-IN' ? 'वापस जोड़ा गया' : language === 'es-ES' ? 'Restaurado' : 'Restored'} ${removedItem.name}`); setRemovedItem(null) }
  const updateItem = (name: string, quantity: number) => { setList((current) => current.map((item) => item.normalizedName === normalize(name) ? { ...item, quantity: Math.max(1, quantity), updatedAt: now() } : item)); setStatus(`${language === 'hi-IN' ? 'अपडेट किया गया' : language === 'es-ES' ? 'Actualizado' : 'Updated'} ${name} ${Math.max(1, quantity)}`) }
  const runCommand = (commandText: string) => {
    const commands = commandText.split(/\s+and\s+/i).map((part) => parseCommand(part)).filter((command) => command.type !== 'unknown')
    setTranscript(commandText)
    setVoiceState('processing')
    window.setTimeout(() => {
      if (!commands.length) setStatus(language === 'hi-IN' ? 'मैं समझ नहीं पाया। फिर कोशिश करें।' : language === 'es-ES' ? 'No entendí eso. Inténtalo de nuevo.' : 'I didn’t catch that. Try again.')
      commands.forEach((command) => {
        if (command.type === 'add') addItem(command.itemName, command.quantity, command.unit)
        else if (command.type === 'remove') removeItem(command.itemName)
        else if (command.type === 'update') updateItem(command.itemName, command.quantity ?? 1)
        else if (command.type === 'search') { const query = command.query.toLowerCase(); const results = products.filter((product) => `${product.name} ${product.brand} ${product.aliases.join(' ')}`.toLowerCase().includes(query) && (!command.maxPrice || product.price <= command.maxPrice) && (!command.brand || product.brand.toLowerCase().includes(command.brand.toLowerCase()))); setSearchResults(results); setSearchLabel(commandText); setStatus(results.length ? `${results.length} ${language === 'hi-IN' ? 'परिणाम मिले' : language === 'es-ES' ? 'resultados encontrados' : 'matches found'}` : language === 'hi-IN' ? 'कोई उत्पाद नहीं मिला' : language === 'es-ES' ? 'No se encontraron productos' : 'No products matched that search') }
      })
      setVoiceState('idle')
    }, 180)
  }
  const startVoice = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.AudioContext) { setShowQuickCommands(true); setStatus('Audio recording is unavailable here. Use a quick command or typed input.'); inputRef.current?.focus(); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const context = new AudioContext()
      const source = context.createMediaStreamSource(stream)
      const processor = context.createScriptProcessor(4096, 1, 1)
      const samples: Float32Array[] = []
      processor.onaudioprocess = (event) => samples.push(new Float32Array(event.inputBuffer.getChannelData(0)))
      source.connect(processor)
      processor.connect(context.destination)
      stopRecording.current = () => {
        processor.onaudioprocess = null
        processor.disconnect()
        source.disconnect()
        stream.getTracks().forEach((track) => track.stop())
        void context.close()
        setVoiceState('processing')
        setStatus(text.understanding)
        void (async () => { try {
          const audio = new Float32Array(samples.reduce((total, sample) => total + sample.length, 0))
          samples.reduce((offset, sample) => { audio.set(sample, offset); return offset + sample.length }, 0)
          const targetLength = Math.round(audio.length * 16000 / context.sampleRate)
          const resampled = new Float32Array(targetLength)
          for (let index = 0; index < targetLength; index++) resampled[index] = audio[Math.min(audio.length - 1, Math.floor(index * audio.length / targetLength))]
          const text = await transcribeWithHuggingFace(createWav(resampled, 16000))
          if (text?.trim()) runCommand(text.trim())
          else { setVoiceState('idle'); setStatus(language === 'hi-IN' ? 'कुछ सुनाई नहीं दिया। फिर कोशिश करें।' : language === 'es-ES' ? 'No detecté palabras. Inténtalo de nuevo.' : 'No words detected. Try again closer to the microphone.'); setShowQuickCommands(true) }
        } catch (error) { setVoiceState('error'); setStatus(`Hugging Face transcription failed: ${error instanceof Error ? error.message : 'unknown error'}`); setShowQuickCommands(true); inputRef.current?.focus() } })()
      }
      setVoiceState('listening'); setStatus('Recording... tap again when finished.')
    } catch { setVoiceState('error'); setStatus('Microphone permission is blocked. Allow it for this site, then try again.'); setShowQuickCommands(true) }
  }
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (input.trim()) { runCommand(input); setInput('') } }
  const toggle = (id: string) => setList((current) => current.map((item) => item.id === id ? { ...item, completed: !item.completed, updatedAt: now() } : item))
  const openHistory = () => { if (historyRef.current) historyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); else setStatus(language === 'hi-IN' ? 'अभी खरीदारी इतिहास उपलब्ध नहीं है।' : language === 'es-ES' ? 'Aún no hay historial de compras.' : 'No shopping history yet.') }

  return <main className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark"><ShoppingBasket size={20} /></span><span>Voice<span className="brand-accent">Shopper</span></span></div><div className="top-actions"><label className="language"><span>Voice language</span><select value={language} onChange={(event) => { const selected = event.target.value as Language; setLanguage(selected); setStatus(copy[selected].ready) }}><option value="en-US">English</option><option value="hi-IN">हिन्दी</option><option value="es-ES">Español</option></select><ChevronDown size={14} /></label><button className="icon-button" aria-label="Settings" onClick={() => setSettingsOpen((open) => !open)}><Settings size={18} /></button></div></header>
    {settingsOpen && <section className="settings-panel" aria-label="Settings"><div><strong>{text.settings}</strong><span>{text.local}</span></div><button onClick={() => { localStorage.removeItem(listKey); localStorage.removeItem(historyKey); setList([]); setHistory([]); setSettingsOpen(false); setStatus(text.clearData) }}>{text.clearData}</button></section>}
    <section className="hero"><div className="eyebrow"><span className="pulse-dot" /> {text.assistant}</div><h1>{text.title}<br /><em>{text.titleAccent}</em></h1><p className="hero-copy">{text.prompt}</p><button className={`mic-button ${voiceState}`} onClick={voiceState === 'listening' ? () => stopRecording.current?.() : startVoice} aria-label={voiceState === 'listening' ? text.listening : text.tap}><span className="mic-wave" /><Mic size={32} strokeWidth={1.8} /><span>{voiceState === 'listening' ? text.listening : voiceState === 'processing' ? text.understanding : text.tap}</span></button><div className="recording-hint" aria-live="polite">{voiceState === 'listening' && 'Recording... tap the microphone again when finished.'}</div><div className={`transcript ${transcript ? 'has-command' : ''}`} aria-live="polite">{transcript && <span className="transcript-label">COMMAND UNDERSTOOD</span>}{transcript ? <><span className="quote">“</span>{transcript}<span className="quote">”</span></> : text.transcript}</div>{showQuickCommands && <div className="quick-commands"><span>{text.nudge}</span>{text.quick.map((command) => <button key={command} onClick={() => { setShowQuickCommands(false); runCommand(command) }}>{command}</button>)}</div>}</section>
    <form className="command-form" onSubmit={submit}><Search size={19} /><input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} placeholder={text.input} aria-label={text.input} /><button type="submit" aria-label={text.search}><Plus size={20} /></button></form>
    <div className={`status ${voiceState}`} aria-live="polite"><Sparkles size={16} /><span className="status-copy"><strong>{voiceState === 'processing' ? 'PROCESSING' : status.startsWith('Added') || status.startsWith('Removed') || status.startsWith('Updated') ? 'ACTION COMPLETED' : 'ASSISTANT STATUS'}</strong>{status}</span>{removedItem && <button className="undo-button" onClick={undoRemove}>{language === 'hi-IN' ? 'वापस' : language === 'es-ES' ? 'Deshacer' : 'Undo'}</button>}</div>
    <div className="content-grid"><section className="list-section"><div className="section-heading"><div><span className="section-kicker">{text.run}</span><h2>{text.list} <span>{activeCount}</span></h2></div>{list.length > 0 && <button className="clear-button" onClick={() => { setList([]); setStatus(text.clear) }}><Trash2 size={15} /> {text.clear}</button>}</div>{list.length === 0 ? <div className="empty"><div className="empty-icon">✦</div><h3>{language === 'hi-IN' ? 'आपकी सूची खाली है।' : language === 'es-ES' ? 'Tu lista está vacía.' : 'Your shopping list is empty'}</h3><p>{language === 'hi-IN' ? 'ऐसा कहकर शुरू करें:' : language === 'es-ES' ? 'Empieza diciendo:' : 'Try saying:'}<br /><strong>“Add 2 bottles of milk”</strong></p></div> : <div className="category-list">{categories.map((category) => <div className="category" key={category}><div className="category-title"><span>{categoryIcons[category]}</span>{categoryText[category]}<small>{list.filter((item) => item.category === category && !item.completed).length}</small></div>{list.filter((item) => item.category === category).map((item) => <div className={`list-item ${item.completed ? 'completed' : ''}`} key={item.id}><button className="check" onClick={() => toggle(item.id)} aria-label={`Mark ${item.name} complete`}>{item.completed && <Check size={15} />}</button><div className="item-name"><strong>{item.name}</strong><span>{categoryText[item.category].toUpperCase()} · {item.quantity}{item.unit !== 'item' ? ` ${item.unit}${item.quantity > 1 ? 's' : ''}` : ''}</span></div><div className="quantity-controls"><button onClick={() => updateItem(item.name, item.quantity - 1)} aria-label={`Decrease ${item.name}`}>−</button><span>{item.quantity}</span><button onClick={() => updateItem(item.name, item.quantity + 1)} aria-label={`Increase ${item.name}`}>+</button></div><button className="remove" onClick={() => removeItem(item.name)} aria-label={`Remove ${item.name}`}><X size={17} /></button></div>)}</div>)}</div>}</section>
      <aside className="side-column"><section className="suggestions"><div className="section-heading"><div><span className="section-kicker">{text.nudge}</span><h2>{text.basket}</h2></div><CircleHelp size={17} /></div>{suggestions.map((product) => <div className="suggestion" key={product.id}><div className="suggestion-icon">{categoryIcons[product.category]}</div><div className="suggestion-info"><strong>{product.name}</strong><span>{product.brand} · ${product.price.toFixed(2)}</span><small>{product.reason}</small></div><button onClick={() => addItem(product.name)} aria-label={`${language === 'hi-IN' ? 'जोड़ें' : language === 'es-ES' ? 'Añadir' : 'Add'} ${product.name}`}><Plus size={18} /></button></div>)}</section><section className="history-panel" ref={historyRef} id="shopping-history"><div className="section-heading"><div><span className="section-kicker">RECENTLY BOUGHT</span><h2>{text.history}</h2></div><History size={17} /></div>{recentHistory.length > 0 ? recentHistory.map((record, index) => <div className="history-row" key={`${record.purchasedAt}-${index}`}><strong>{record.productName}</strong><span>{record.quantity} · {ageLabel(record.purchasedAt)}</span></div>) : <p className="no-history">{language === 'hi-IN' ? 'अभी खरीदारी इतिहास उपलब्ध नहीं है।' : language === 'es-ES' ? 'Aún no hay historial de compras.' : 'Your recent purchases will appear here.'}</p>}</section>{searchLabel && <section className="results"><div className="section-heading"><div><span className="section-kicker">SEARCH RESULTS</span><h2>{language === 'hi-IN' ? 'परिणाम' : language === 'es-ES' ? 'Resultados' : 'Matches'}</h2></div><button className="remove" onClick={() => setSearchLabel('')} aria-label="Close search results"><X size={17} /></button></div><div className="search-query">{searchLabel}</div>{searchFilters && <div className="filter-chips"><span>{searchFilters}</span></div>}{searchResults.map((product) => <div className="result" key={product.id}><div className="result-icon">{categoryIcons[product.category]}</div><div><strong>{product.name}</strong><span>{product.brand} · ${product.price.toFixed(2)} · {product.unitLabel}</span>{product.onSale && <small>ON SALE TODAY</small>}</div><button onClick={() => addItem(product.name)}><Plus size={16} /> {language === 'hi-IN' ? 'जोड़ें' : language === 'es-ES' ? 'Añadir' : 'Add'}</button></div>)}{resultSubstitutes.length > 0 && <div className="substitutes"><span className="section-kicker">ALTERNATIVE AVAILABLE</span><strong>You may also like</strong>{resultSubstitutes.map((product) => <div className="substitute" key={product.id}><span>{product.name}</span><button onClick={() => addItem(product.name)} aria-label={`Add ${product.name}`}><Plus size={15} /></button></div>)}</div>}{!searchResults.length && <p className="no-results">{language === 'hi-IN' ? 'कोई उत्पाद नहीं मिला।' : language === 'es-ES' ? 'No se encontraron productos.' : 'No matching products found. Try another search term.'}</p>}</section>}</aside></div>
    <footer><span>{text.footer}</span><span>{text.local}</span></footer><nav className="bottom-nav" aria-label="Primary navigation"><button className="active"><Home size={17} /><span>{text.home}</span></button><button onClick={openHistory}><History size={17} /><span>{text.history}</span></button><button className="nav-voice" onClick={voiceState === 'listening' ? () => stopRecording.current?.() : startVoice} aria-label={text.voice}><Mic size={19} /><span>{text.voice}</span></button><button onClick={() => inputRef.current?.focus()}><Search size={17} /><span>{text.search}</span></button><button onClick={() => setSettingsOpen(true)}><Settings size={17} /><span>{text.profile}</span></button></nav>
  </main>
}
export default App
