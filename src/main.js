import { mount } from 'svelte'
import './app.css'
import './theme.css'
import NewApp from './NewApp.svelte'

const app = mount(NewApp, {
  target: document.getElementById('app'),
})

export default app
