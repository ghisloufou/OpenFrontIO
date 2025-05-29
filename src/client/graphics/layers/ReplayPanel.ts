import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { translateText } from "../../../client/Utils";
import { EventBus } from "../../../core/EventBus";
import { GameView } from "../../../core/game/GameView";
import { ReplayIntervalEvent } from "../../InputHandler";
import { UIState } from "../UIState";
import { Layer } from "./Layer";

const MAX_REPLAY_INTERVAL_MS = 250;

@customElement("replay-panel")
export class ReplayPanel extends LitElement implements Layer {
  public game: GameView;
  public eventBus: EventBus;
  public uiState: UIState;

  @state()
  private _replayInterval: number = 5;

  @state()
  private _isVisible = false;

  tick() {
    if (!this._isVisible && this.game.config().isReplay()) {
      this.setVisibile(true);
    }

    this.requestUpdate();
  }

  onReplayIntervalChange(value: number) {
    this.uiState.replayInterval = value;
    this.eventBus.emit(new ReplayIntervalEvent(value));
  }

  renderLayer(context: CanvasRenderingContext2D) {
    // Render any necessary canvas elements
  }

  shouldTransform(): boolean {
    return false;
  }

  setVisibile(visible: boolean) {
    this._isVisible = visible;
    this.requestUpdate();
  }

  render() {
    return html`
      <style>
        input[type="range"] {
          -webkit-appearance: none;
          background: transparent;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: white;
          border-width: 2px;
          border-style: solid;
          border-radius: 50%;
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: white;
          border-width: 2px;
          border-style: solid;
          border-radius: 50%;
          cursor: pointer;
        }
      </style>

      <div
        class="${this._isVisible
          ? "min-w-fit bg-opacity-60 bg-gray-900 p-1 lg:p-2 rounded-es-sm lg:rounded-lg backdrop-blur-md pointer-events-auto"
          : "hidden"}"
        @contextmenu=${(e) => e.preventDefault()}
      >
        <div class="relative">
          <label class="block text-white" translate="no">
            ${translateText("replay_panel.replay_speed")}:
            x${(MAX_REPLAY_INTERVAL_MS / this._replayInterval)
              .toFixed(1)
              .replace(/[.,]0$/, "")}
          </label>

          <div class="relative h-8">
            <!-- Background track -->
            <div
              class="absolute left-0 right-0 top-3 h-2 bg-white/20 rounded"
            ></div>
            <!-- Fill track -->
            <div
              class="absolute left-0 top-3 h-2 bg-red-500/60 rounded transition-all duration-300"
            ></div>
            <!-- Range input - exactly overlaying the visual elements -->
            <input
              id="replay-interval"
              type="range"
              min="5"
              step="1"
              max=${MAX_REPLAY_INTERVAL_MS}
              .value=${this._replayInterval}
              @change=${(e: Event) => {
                if (!(e.target instanceof HTMLInputElement)) {
                  return;
                }
                const value = e.target.value;
                this._replayInterval = parseFloat(value);
                this.onReplayIntervalChange(this._replayInterval);
              }}
              class="absolute left-0 right-0 top-2 m-0 h-4 cursor-pointer"
            />
          </div>
        </div>
      </div>
    `;
  }

  createRenderRoot() {
    return this; // Disable shadow DOM to allow Tailwind styles
  }
}
