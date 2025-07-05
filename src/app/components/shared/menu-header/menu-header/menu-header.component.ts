import tippy from 'tippy.js';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { featherAirplay, featherFacebook } from '@ng-icons/feather-icons';
import {
  lucideFacebook,
  lucideLinkedin,
  lucideGithub,
  lucideInstagram,
  lucideGamepad2,
} from '@ng-icons/lucide';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { EyeTracking } from '../../eye-tracking/eye-tracking';
import { ReflectorBulbServices } from '../../../services/reflector-bulb-services/reflector-bulb-services';
import { HomeServices } from '../../../services/home-services/home-services';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router, RouterModule } from '@angular/router';
export const headerSlideIn = trigger('headerSlideIn', [
  transition(':enter', [
    style({ transform: 'translateY(-100%)', opacity: 0 }),
    animate(
      '400ms ease-out',
      style({ transform: 'translateY(0)', opacity: 1 })
    ),
  ]),
  transition(':leave', [
    animate(
      '300ms ease-in',
      style({ transform: 'translateY(-100%)', opacity: 0 })
    ),
  ]),
]);
@Component({
  selector: 'app-menu-header',
  imports: [FlexLayoutModule, EyeTracking, CommonModule, RouterModule],
  standalone: true,
  templateUrl: './menu-header.component.html',
  styleUrl: './menu-header.component.scss',
  // Elimina o reduce la animación si quieres máxima fluidez
  animations: [headerSlideIn],
  viewProviders: [
    provideIcons({
      featherAirplay,
      featherFacebook,
      lucideFacebook,
      lucideLinkedin,
      lucideGithub,
      lucideInstagram,
      lucideGamepad2,
    }),
  ],
})
export class MenuHeaderComponent implements OnInit, AfterViewInit {
  lampTurnOn: boolean = false;
  modePlaySnake = true;
  showMenu = false;

  // Referencia al menú para saber si el click fue dentro o fuera
  @ViewChild('mobileMenu') mobileMenuRef!: ElementRef;

  // Listener para click fuera y tecla ESC
  private documentClickListener: any;
  private escapeKeyListener: any;

  constructor(
    private reflectorBulbServices: ReflectorBulbServices,
    private homeServices: HomeServices,
    private router: Router,
    private elRef: ElementRef
  ) {}

  /**
   * Detecta si el dispositivo es móvil
   * @returns true si el ancho de la ventana es menor a 992px, false en caso contrario
   * Esta propiedad se usa para determinar si se debe mostrar el menú de navegación
   * en modo móvil o de escritorio.
   */
  get isMobile() {
    return window.innerWidth < 992;
  }

  ngAfterViewInit(): void {
    this.initTippy();
  }

  ngOnInit(): void {
    this.activeModeGame(false);
    this.onResize();
    window.addEventListener('resize', () => this.onResize());
  }

  ngOnDestroy(): void {
    this.removeDocumentListeners();
  }

  /**
   * Método para inicializar Tippy.js en los elementos con la clase 'tooltip-header'.
   * Cada elemento recibe su propio ID como contenido del tooltip.
   *
   *  @returns void
   *  @description Este método se llama después de que la vista se ha inicializado,
   *  @version 1.0.0
   *  @author Arlez Camilo Ceron Herrera
   */
  initTippy() {
    const tippyElements = document.querySelectorAll('.tooltip-header');
    tippyElements.forEach((element) => {
      const elementId = (element as HTMLElement).id;
      tippy(element, {
        content: elementId,
        placement: 'bottom',
        arrow: true,
        theme: 'light',
      });
    });
  }

  /**
   * Método para alternar el estado de la lámpara.
   * Envía un evento a los servicios del reflectorBulbServices para encender o apagar la lámpara.
   * Actualiza la propiedad lampTurnOn para reflejar el estado actual de la lámpara.
   *
   * @returns void
   * @version 1.0.0
   * @author Arlez Camilo Ceron Herrera
   */
  onClickLight() {
    if (this.lampTurnOn) {
      this.reflectorBulbServices.reflectorBulbEvent.next({
        action: 'turnOff',
        message: 'Reflector bulb turned off',
      });
      this.lampTurnOn = false;
    } else {
      this.reflectorBulbServices.reflectorBulbEvent.next({
        action: 'turnOn',
        message: 'Reflector bulb turned on',
      });
      this.lampTurnOn = true;
    }
  }

  /**
   * Método para activar o desactivar el modo de juego.
   * Si se activa, envía un evento a los servicios del snakeService para iniciar el juego.
   * Si se desactiva, envía un evento para salir del modo de juego.
   *
   * @param turnOn - Si es true, activa el modo de juego; si es false, lo desactiva.
   * @returns void
   * @version 1.0.0
   * @author Arlez Camilo Ceron Herrera
   */
  activeModeGame(turnOn?: boolean) {
    if (turnOn) {
      this.homeServices.snakeService.next({
        action: 'activeModeGame',
        message: 'Active mode game',
        endGame: false,
      });
      this.modePlaySnake = false;
    } else {
      this.leaveModeGame();
      this.modePlaySnake = true;
    }
  }

  /**
   * Método para salir del modo de juego.
   * Envía un evento a los servicios del snakeService para finalizar el juego.
   *
   * @returns void
   * @version 1.0.0
   * @author Arlez Camilo Ceron Herrera
   */
  leaveModeGame() {
    this.homeServices.snakeService.next({
      action: 'leaveModeGame',
      message: 'Leave mode game',
      endGame: true,
    });
  }

  /**
   * Método para desplazar la ventana hacia una sección específica del documento.
   * Utiliza el método scrollIntoView para un desplazamiento suave.
   * Si el dispositivo es móvil, oculta el menú después de hacer scroll.
   *
   * @param sectionId - El ID de la sección a la que se desea desplazar.
   * @returns void
   * @version 1.0.0
   * @author Arlez Camilo Ceron Herrera
   */
  scrollToSection(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      if (this.isMobile) this.showMenu = false;
    }
  }

  /**
   * Método para manejar el evento de cambio de tamaño de la ventana.
   * Si el dispositivo no es móvil, muestra el menú y elimina la clase 'no-scroll' del body.
   * Si es móvil, oculta el menú y también elimina la clase 'no-scroll'.
   *
   * @returns void
   * @version 1.0.0
   * @author Arlez Camilo Ceron Herrera
   */
  onResize() {
    if (!this.isMobile) {
      this.showMenu = true;
      document.body.classList.remove('no-scroll');
    } else {
      this.showMenu = false;
      document.body.classList.remove('no-scroll');
    }
  }

  /**
   * Método para alternar la visibilidad del menú.
   * Cambia el estado de showMenu y agrega o quita la clase 'no-scroll' del body según corresponda.
   *
   * @returns void
   * @version 1.0.0
   * @author Arlez Camilo Ceron Herrera
   */
  toggleMenu() {
    this.showMenu = !this.showMenu;
    if (this.showMenu && this.isMobile) {
      document.body.classList.add('no-scroll');
      setTimeout(() => this.addDocumentListeners(), 0); // <---- Aquí el cambio
    } else {
      document.body.classList.remove('no-scroll');
      this.removeDocumentListeners();
    }
  }

  /**
   * Método para agregar listeners al documento para detectar clicks fuera del menú y la tecla ESC.
   * Si el menú está visible, agrega un listener para clicks fuera del menú y otro para la tecla ESC.
   * Estos listeners se encargan de ocultar el menú si se detecta un click fuera del menú o si se presiona la tecla ESC.
   * @returns void
   * @version 1.0.0
   * @author Arlez Camilo Ceron Herrera
   */
  hideMenu() {
    this.showMenu = false;
    document.body.classList.remove('no-scroll');
    this.removeDocumentListeners();
  }

  /**
   * Método para eliminar los listeners del documento.
   * Elimina los listeners de click y de tecla ESC si existen.
   *
   * @returns void
   * @version 1.0.0
   * @author Arlez Camilo Ceron Herrera
   */
  private addDocumentListeners() {
    if (!this.documentClickListener) {
      this.documentClickListener = (event: MouseEvent) => {
        const navToggler = this.elRef.nativeElement.querySelector('.navbar-toggler');
        if (
          this.showMenu &&
          this.isMobile &&
          this.mobileMenuRef &&
          !this.mobileMenuRef.nativeElement.contains(event.target) && // <--- SOLO FUERA DEL NAV
          !(navToggler && navToggler.contains(event.target))
        ) {
          this.hideMenu();
        }
      };
      document.addEventListener('mousedown', this.documentClickListener, true);
    }
  }

  /**
   * Método para eliminar los listeners del documento.
   * Elimina los listeners de click y de tecla ESC si existen.
   *
   * @returns void
   * @version 1.0.0
   * @author Arlez Camilo Ceron Herrera
   */
  private removeDocumentListeners() {
    if (this.documentClickListener) {
      document.removeEventListener(
        'mousedown',
        this.documentClickListener,
        true
      );
      this.documentClickListener = null;
    }
    if (this.escapeKeyListener) {
      document.removeEventListener('keydown', this.escapeKeyListener, true);
      this.escapeKeyListener = null;
    }
  }

  /**
   * Método para navegar a una página específica.
   * Utiliza el router de Angular para cambiar la URL y navegar a la página deseada.
   *
   * @param pageName - El nombre de la página a la que se desea navegar.
   * @returns void
   * @version 1.0.0
   * @author Arlez Camilo Ceron Herrera
   */
  goToPage(pageName: string) {
    console.log('Navigating to:', pageName);
    this.router.navigateByUrl(pageName);
  }

  /**
   * Método para verificar si una ruta específica está activa.
   * Compara la URL actual del router con la ruta proporcionada.
   *
   * @param route - La ruta a verificar.
   * @returns true si la ruta está activa, false en caso contrario.
   * @version 1.0.0
   * @author Arlez Camilo Ceron Herrera
   */
  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
}
