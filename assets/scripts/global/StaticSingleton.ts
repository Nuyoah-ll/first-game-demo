import { GameManager } from "../runtime/GameManager";
import { UIManager } from "../runtime/UIManager";
import { BattleManager } from "../runtime/BattleManager";
import { MapPage } from "../ui/MapPage";

export class StaticSingleton {
    static GameManager: GameManager | null = null;
    static UIManager: UIManager | null = null;
    static BattleManager: BattleManager | null = null;
    static MapPage: MapPage | null = null;

    static setGameManager(gameManager: GameManager) {
        StaticSingleton.GameManager = gameManager;
    }

    static setUIManager(uiManager: UIManager) {
        StaticSingleton.UIManager = uiManager;
    }

    static setBattleManager(battleManager: BattleManager) {
        StaticSingleton.BattleManager = battleManager;
    }

    static setMapPage(mapPage: MapPage) {
        StaticSingleton.MapPage = mapPage;
    }
}