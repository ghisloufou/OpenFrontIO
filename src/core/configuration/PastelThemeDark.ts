import { Colord, colord } from "colord";
import { PseudoRandom } from "../PseudoRandom";
import { simpleHash } from "../Util";
import { ColoredTeams, PlayerType, Team, TerrainType } from "../game/Game";
import { GameMap, TileRef } from "../game/GameMap";
import { PlayerView } from "../game/GameView";
import {
  blue,
  botColor,
  botColors,
  green,
  humanColors,
  orange,
  purple,
  red,
  teal,
  territoryColors,
  yellow,
} from "./Colors";
import { Theme } from "./Config";

export const pastelThemeDark = new (class implements Theme {
  private rand = new PseudoRandom(123);

  private background = colord({ r: 0, g: 0, b: 0 });
  private land = colord({ r: 194, g: 193, b: 148 });
  private shore = colord({ r: 134, g: 133, b: 88 });
  private falloutColors = [
    colord({ r: 120, g: 255, b: 71 }), // Original color
    colord({ r: 130, g: 255, b: 85 }), // Slightly lighter
    colord({ r: 110, g: 245, b: 65 }), // Slightly darker
    colord({ r: 125, g: 255, b: 75 }), // Warmer tint
    colord({ r: 115, g: 250, b: 68 }), // Cooler tint
  ];
  private water = colord({ r: 14, g: 11, b: 30 });
  private shorelineWater = colord({ r: 50, g: 50, b: 50 });

  private _selfColor = colord({ r: 0, g: 255, b: 0 });
  private _allyColor = colord({ r: 255, g: 255, b: 0 });
  private _enemyColor = colord({ r: 255, g: 0, b: 0 });

  private _spawnHighlightColor = colord({ r: 255, g: 213, b: 79 });

  teamColor(team: Team): Colord {
    switch (team) {
      case ColoredTeams.Blue:
        return blue;
      case ColoredTeams.Red:
        return red;
      case ColoredTeams.Teal:
        return teal;
      case ColoredTeams.Purple:
        return purple;
      case ColoredTeams.Yellow:
        return yellow;
      case ColoredTeams.Orange:
        return orange;
      case ColoredTeams.Green:
        return green;
      case ColoredTeams.Bot:
        return botColor;
      default:
        return humanColors[simpleHash(team) % humanColors.length];
    }
  }

  territoryColor(player: PlayerView): Colord {
    const team = player.team();
    if (team !== null) {
      return this.teamColor(team);
    }
    if (player.info().playerType === PlayerType.Human) {
      return humanColors[simpleHash(player.id()) % humanColors.length];
    }
    if (player.info().playerType === PlayerType.Bot) {
      return botColors[simpleHash(player.id()) % botColors.length];
    }
    return territoryColors[simpleHash(player.id()) % territoryColors.length];
  }

  textColor(player: PlayerView): string {
    return player.info().playerType === PlayerType.Human
      ? "#ffffff"
      : "#e6e6e6";
  }

  specialBuildingColor(player: PlayerView): Colord {
    const tc = this.territoryColor(player).rgba;
    return colord({
      r: Math.max(tc.r - 50, 0),
      g: Math.max(tc.g - 50, 0),
      b: Math.max(tc.b - 50, 0),
    });
  }

  borderColor(player: PlayerView): Colord {
    const tc = this.territoryColor(player).rgba;
    return colord({
      r: Math.max(tc.r - 40, 0),
      g: Math.max(tc.g - 40, 0),
      b: Math.max(tc.b - 40, 0),
    });
  }

  defendedBorderColors(player: PlayerView): { light: Colord; dark: Colord } {
    return {
      light: this.territoryColor(player).darken(0.2),
      dark: this.territoryColor(player).darken(0.4),
    };
  }

  focusedBorderColor(): Colord {
    return colord({ r: 255, g: 255, b: 255 });
  }

  terrainColor(gm: GameMap, tile: TileRef): Colord {
    const mag = gm.magnitude(tile);
    if (gm.isShore(tile)) {
      return this.shore;
    }
    switch (gm.terrainType(tile)) {
      case TerrainType.Ocean:
      case TerrainType.Lake:
        const w = this.water.rgba;
        if (gm.isShoreline(tile) && gm.isWater(tile)) {
          return this.shorelineWater;
        }
        if (gm.magnitude(tile) < 10) {
          return colord({
            r: Math.max(w.r + 9 - mag, 0),
            g: Math.max(w.g + 9 - mag, 0),
            b: Math.max(w.b + 9 - mag, 0),
          });
        }
        return this.water;
      case TerrainType.Plains:
        return colord({
          r: 140,
          g: 170 - 2 * mag,
          b: 88,
        });
      case TerrainType.Highland:
        return colord({
          r: 150 + 2 * mag,
          g: 133 + 2 * mag,
          b: 88 + 2 * mag,
        });
      case TerrainType.Mountain:
        return colord({
          r: 180 + mag / 2,
          g: 180 + mag / 2,
          b: 180 + mag / 2,
        });
    }
  }

  backgroundColor(): Colord {
    return this.background;
  }

  falloutColor(): Colord {
    return this.rand.randElement(this.falloutColors);
  }

  font(): string {
    return "Overpass, sans-serif";
  }

  selfColor(): Colord {
    return this._selfColor;
  }
  allyColor(): Colord {
    return this._allyColor;
  }
  enemyColor(): Colord {
    return this._enemyColor;
  }

  spawnHighlightColor(): Colord {
    return this._spawnHighlightColor;
  }
})();
