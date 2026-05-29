import ReactDOM from 'react-dom/client'
import { Component } from 'react'
import App from './App'
import './index.css'

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null, info: null } }
  static getDerivedStateFromError(e) { return { error: e } }
  componentDidCatch(e, info) {
    this.setState({ info })
    console.error('APP CRASH:', e, info)
  }
  render() {
    if (this.state.error) {
      const stack = this.state.info?.componentStack || ''
      return (
        <div style={{
          position:'fixed',inset:0,display:'flex',alignItems:'flex-start',justifyContent:'center',
          background:'#0f1117',color:'#fff',flexDirection:'column',gap:12,padding:24,
          fontFamily:'monospace', overflowY:'auto'
        }}>
          <div style={{fontSize:32,margin:'0 auto'}}>⚠️</div>
          <div style={{fontSize:16,fontWeight:900,color:'#fabd00',margin:'0 auto'}}>Ilova xatosi — to\'liq ma\'lumot:</div>
          <pre style={{
            background:'rgba(255,0,0,.1)',border:'1px solid rgba(255,0,0,.3)',
            borderRadius:10,padding:14,fontSize:11,width:'100%',overflowX:'auto',
            color:'#fca5a5',whiteSpace:'pre-wrap',wordBreak:'break-all'
          }}>ERROR: {String(this.state.error)}{'\n\n'}STACK: {this.state.error?.stack?.slice(0,1000)}</pre>
          <pre style={{
            background:'rgba(250,189,0,.08)',border:'1px solid rgba(250,189,0,.2)',
            borderRadius:10,padding:14,fontSize:11,width:'100%',overflowX:'auto',
            color:'#fde68a',whiteSpace:'pre-wrap',wordBreak:'break-all'
          }}>COMPONENT: {stack.slice(0,800)}</pre>
          <button onClick={() => window.location.reload()}
            style={{padding:'10px 24px',background:'#fabd00',color:'#000',
              border:'none',borderRadius:10,fontWeight:900,cursor:'pointer',fontSize:13,margin:'0 auto'}}>
            Qayta yuklash
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// HMR-safe: reuse existing root if present (prevents "createRoot on same container" warning)
const container = document.getElementById('root')
if (!container._sbRoot) {
  container._sbRoot = ReactDOM.createRoot(container)
}
container._sbRoot.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
