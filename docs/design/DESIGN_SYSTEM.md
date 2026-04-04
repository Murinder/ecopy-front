# ЕЦОПУ — Дизайн-система (Design Tokens)

> Все значения извлечены из макетов Figma. Придерживайся их при реализации КАЖДОГО компонента.

---

## 1. Цветовая палитра

### 1.1 Основные фоны (Backgrounds)

| Токен | Hex | Использование |
|---|---|---|
| `--bg-primary` | `#0B1437` | Основной фон приложения, sidebar, страница логина |
| `--bg-secondary` | `#111C44` | Фон карточек, панелей, контентной области |
| `--bg-tertiary` | `#1B254B` | Фон вложенных блоков внутри карточек, ховер-состояние в sidebar |
| `--bg-surface` | `#192555` | Фон элементов внутри карточек (таблицы, блоки статистики) |
| `--bg-white` | `#FFFFFF` | Фон формы логина (левая панель), модальные окна светлой темы |
| `--bg-card-light` | `#F8F9FA` | Фон карточек внутри светлых модалок и правых панелей |

### 1.2 Акцентные цвета (Brand & Accent)

| Токен | Hex | Использование |
|---|---|---|
| `--accent-primary` | `#3B82F6` | Основная кнопка "Войти", активные элементы, ссылки |
| `--accent-primary-hover` | `#2563EB` | Ховер основной кнопки |
| `--accent-secondary` | `#4318FF` | Иконки в sidebar (активный пункт), акцентные элементы |
| `--accent-info` | `#3965FF` | Информационные бейджи, иконки фичей на логин-странице |
| `--accent-light` | `#E9EFFF` | Светлый фон для иконок фичей (на странице логина правая часть) |

### 1.3 Статусные цвета (Status)

| Токен | Hex | Использование |
|---|---|---|
| `--status-success` | `#05CD99` | Зелёные бейджи "Завершён", позитивные метрики, галочки |
| `--status-success-bg` | `#05CD991A` | Фон зелёных бейджей (10% прозрачность) |
| `--status-warning` | `#FFCE20` | Жёлтые бейджи "В процессе", предупреждения |
| `--status-warning-bg` | `#FFCE201A` | Фон жёлтых бейджей |
| `--status-error` | `#EE5D50` | Красные бейджи "Отклонено", ошибки, негативные метрики |
| `--status-error-bg` | `#EE5D501A` | Фон красных бейджей |
| `--status-pending` | `#868CFF` | Бейджи "На рассмотрении", ожидание |
| `--status-pending-bg` | `#868CFF1A` | Фон бейджей ожидания |

### 1.4 Цвета текста (Typography Colors)

| Токен | Hex | Использование |
|---|---|---|
| `--text-primary-dark` | `#FFFFFF` | Основной текст на тёмном фоне |
| `--text-secondary-dark` | `#A3AED0` | Вторичный текст, подписи, лейблы на тёмном фоне |
| `--text-tertiary-dark` | `#707EAE` | Третичный текст, плейсхолдеры на тёмном фоне |
| `--text-primary-light` | `#1B2559` | Основной текст на светлом фоне (модалки, форма логина) |
| `--text-secondary-light` | `#A3AED0` | Вторичный текст на светлом фоне |
| `--text-tertiary-light` | `#B0BBD5` | Подписи и хинты на светлом фоне |
| `--text-link` | `#3B82F6` | Ссылки ("Забыли пароль?", "Подробнее") |

### 1.5 Цвета графиков (Chart Colors)

| Токен | Hex | Использование |
|---|---|---|
| `--chart-blue` | `#4318FF` | Основная линия/столбец |
| `--chart-cyan` | `#05CD99` | Вторая серия данных |
| `--chart-purple` | `#868CFF` | Третья серия |
| `--chart-orange` | `#FFB547` | Четвёртая серия |
| `--chart-green-area` | `#05CD9933` | Заливка area chart (с прозрачностью) |
| `--chart-pie-1` | `#4318FF` | Первый сегмент pie chart |
| `--chart-pie-2` | `#05CD99` | Второй сегмент |
| `--chart-pie-3` | `#FFB547` | Третий сегмент |
| `--chart-pie-4` | `#868CFF` | Четвёртый сегмент |

### 1.6 Бордеры (Borders)

| Токен | Hex | Использование |
|---|---|---|
| `--border-dark` | `#FFFFFF1A` | Бордеры карточек на тёмном фоне (10% белый) |
| `--border-light` | `#E2E8F0` | Бордеры инпутов и карточек на светлом фоне |
| `--border-input` | `#E2E8F0` | Бордер полей ввода в форме логина |
| `--border-input-focus` | `#3B82F6` | Бордер поля ввода при фокусе |
| `--border-divider` | `#E2E8F01A` | Разделители в sidebar и списках |

---

## 2. Типографика

### 2.1 Шрифт

```
Основной шрифт: "DM Sans", sans-serif
Запасные: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

### 2.2 Размеры текста

| Токен | Размер | Вес | Line-height | Использование |
|---|---|---|---|---|
| `--text-display` | 42px | 700 (Bold) | 1.2 | Заголовок на странице логина "Добро пожаловать..." |
| `--text-h1` | 28px | 700 (Bold) | 1.3 | Заголовки страниц ("Преподаватели", "Мои проекты") |
| `--text-h2` | 22px | 700 (Bold) | 1.35 | Заголовки секций, заголовки карточек |
| `--text-h3` | 18px | 600 (SemiBold) | 1.4 | Подзаголовки, названия блоков |
| `--text-h4` | 16px | 600 (SemiBold) | 1.4 | Названия элементов в списках |
| `--text-body` | 14px | 400 (Regular) | 1.5 | Основной текст, описания |
| `--text-body-medium` | 14px | 500 (Medium) | 1.5 | Акцентированный основной текст |
| `--text-small` | 12px | 400 (Regular) | 1.5 | Подписи, метки, мелкий текст |
| `--text-small-medium` | 12px | 500 (Medium) | 1.5 | Бейджи, статусы |
| `--text-xs` | 10px | 500 (Medium) | 1.4 | Самый мелкий текст (подписи осей графиков) |
| `--text-stat-big` | 34px | 700 (Bold) | 1.2 | Крупные цифры метрик (1,000+, 50+, 98%) |
| `--text-stat-medium` | 24px | 700 (Bold) | 1.2 | Числа в карточках статистики на дашборде |
| `--text-stat-label` | 12px | 400 (Regular) | 1.5 | Подписи к числам статистики |

---

## 3. Отступы и размеры (Spacing & Sizing)

### 3.1 Базовая сетка

```
Базовый шаг: 4px
Шкала: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px
```

### 3.2 Отступы компонентов

| Элемент | Padding | Использование |
|---|---|---|
| Страница (контент) | `32px` | Отступ контента от sidebar и сверху |
| Карточка (большая) | `24px` | Внутренний отступ карточек-панелей |
| Карточка (малая) | `16px` | Внутренний отступ stat-карточек и элементов списка |
| Элемент списка | `16px 20px` | Строки в списках преподавателей, проектов |
| Кнопка (primary) | `12px 32px` | Основные кнопки |
| Кнопка (secondary) | `10px 24px` | Второстепенные кнопки |
| Инпут | `12px 16px` | Поля ввода |
| Бейдж/тег | `4px 12px` | Статусные бейджи |
| Таб | `8px 20px` | Элементы табов |
| Sidebar item | `12px 16px` | Пункты навигации |

### 3.3 Gaps (промежутки)

| Контекст | Gap |
|---|---|
| Между карточками на странице | `24px` |
| Между stat-карточками (горизонтально) | `20px` |
| Между элементами списка | `0px` (разделены border-bottom) |
| Между секциями внутри карточки | `24px` |
| Между label и инпутом | `8px` |
| Между полями формы | `20px` |
| Sidebar items | `4px` |

---

## 4. Скругления (Border Radius)

| Токен | Значение | Использование |
|---|---|---|
| `--radius-none` | `0px` | — |
| `--radius-sm` | `8px` | Бейджи, маленькие элементы |
| `--radius-md` | `12px` | Кнопки, инпуты, табы |
| `--radius-lg` | `16px` | Карточки, панели, sidebar-контейнер |
| `--radius-xl` | `20px` | Модальные окна, большие карточки |
| `--radius-2xl` | `24px` | Форма логина (левая панель) |
| `--radius-full` | `9999px` | Аватары, круглые бейджи, pill-кнопки ("Вход"/"Регистрация") |

---

## 5. Тени (Shadows)

| Токен | Значение | Использование |
|---|---|---|
| `--shadow-card` | `0 4px 24px rgba(0, 0, 0, 0.12)` | Карточки на тёмном фоне |
| `--shadow-modal` | `0 8px 40px rgba(0, 0, 0, 0.24)` | Модальные окна |
| `--shadow-dropdown` | `0 4px 16px rgba(0, 0, 0, 0.16)` | Выпадающие меню |
| `--shadow-button` | `0 2px 8px rgba(59, 130, 246, 0.3)` | Основная кнопка при ховере |
| `--shadow-light-card` | `0 2px 12px rgba(0, 0, 0, 0.06)` | Карточки на светлом фоне (модалки) |

---

## 6. Компоненты — детальные спецификации

### 6.1 Sidebar (Боковая навигация)

```
Ширина: 280px
Фон: --bg-primary (#0B1437)
Padding: 24px 16px
Позиция: fixed, left: 0, top: 0, height: 100vh

Логотип:
  - Иконка книги в квадрате 40x40px, border-radius: 12px, фон: --accent-secondary
  - Текст "ЕЦОПУ": --text-h3 (18px, SemiBold), цвет: белый
  - Подпись: --text-small (12px), цвет: --text-secondary-dark
  - Margin-bottom: 32px

Пункт навигации (неактивный):
  - Height: 44px
  - Padding: 12px 16px
  - Border-radius: --radius-md (12px)
  - Иконка: 20x20px, цвет: --text-secondary-dark (#A3AED0)
  - Текст: --text-body (14px, Regular), цвет: --text-secondary-dark
  - Gap иконка-текст: 12px
  - Hover: фон --bg-tertiary

Пункт навигации (активный):
  - Фон: --bg-tertiary (#1B254B) или лёгкая подсветка
  - Иконка: цвет --accent-primary (#3B82F6)
  - Текст: цвет белый, вес 600 (SemiBold)
  - Полоска слева: 3px, цвет --accent-primary, border-radius: 2px

Разделитель секций:
  - border-top: 1px solid --border-divider
  - Margin: 16px 0

Блок пользователя (низ sidebar):
  - Position: absolute, bottom: 24px
  - Аватар: 40x40px, border-radius: --radius-full
  - Имя: --text-body-medium (14px, 500), белый
  - Роль: --text-small (12px), --text-secondary-dark
  - Кнопка выхода: иконка 20px, --text-secondary-dark
```

### 6.2 Навигация по роли (пункты sidebar)

**Заведующий кафедрой:**
1. 📋 Преподаватели
2. 🏆 Топ проекты
3. 📊 Аналитика
4. 📅 Расписание защит
5. 📄 Отчёты
6. 👤 Личный кабинет

**Преподаватель:**
1. 📁 Курируемые проекты
2. 📨 Заявки студентов
3. 📅 Календарь мероприятий
4. 🗓 Расписание
5. 📄 Отчёты
6. 📊 Активность
7. 👤 Личный кабинет

**Студент:**
1. 📁 Мои проекты
2. 📊 Активность
3. 🎯 Мероприятия
4. ⭐ Мой рейтинг
5. 👤 Личный кабинет

### 6.3 Stat-карточка (KPI Card)

```
Размер: flex-grow, min-width: ~200px
Фон: --bg-secondary (#111C44)
Border: 1px solid --border-dark
Border-radius: --radius-lg (16px)
Padding: 20px 24px

Число:
  - --text-stat-medium (24px, Bold)
  - Цвет: белый
  
Подпись:
  - --text-small (12px, Regular)
  - Цвет: --text-secondary-dark (#A3AED0)
  - Margin-top: 4px

Иконка (опционально):
  - 24x24px в кружке 40x40px
  - Фон кружка: --accent-primary с 15% прозрачностью
  - Позиция: справа сверху

Стрелка тренда (опционально):
  - ▲ зелёная (#05CD99) или ▼ красная (#EE5D50)
  - Рядом с числом, --text-small
```

### 6.4 Карточка графика (Chart Card)

```
Фон: --bg-secondary (#111C44)
Border: 1px solid --border-dark
Border-radius: --radius-lg (16px)
Padding: 24px

Заголовок:
  - --text-h3 (18px, SemiBold), белый
  - Margin-bottom: 4px
  
Подзаголовок:
  - --text-small (12px), --text-secondary-dark
  - Margin-bottom: 20px
  
Область графика:
  - Высота: ~200-280px
  - Оси: --text-xs (10px), цвет --text-tertiary-dark (#707EAE)
  - Сетка: 1px dashed, --border-dark
  - Линии графиков: stroke-width: 2-3px
  - Area fill: соответствующий chart-color с 20% прозрачностью
  - Точки на линиях: 6px circles при ховере

Легенда (если есть):
  - Позиция: справа сверху или снизу
  - Цветной кружок 8px + текст --text-small
  - Gap: 16px между элементами
```

### 6.5 Таблица / Список (Data List)

```
Фон контейнера: --bg-secondary (#111C44)
Border-radius: --radius-lg (16px)
Overflow: hidden

Заголовок таблицы:
  - Padding: 20px 24px
  - Заголовок: --text-h2 (22px, Bold), белый
  - Поиск + фильтры: справа
  
Строка таблицы:
  - Padding: 16px 24px
  - Border-bottom: 1px solid --border-dark
  - Hover: фон --bg-tertiary
  - Transition: background 0.15s ease
  
Аватар в строке:
  - 40x40px, border-radius: --radius-full
  - Fallback: инициалы на фоне --accent-primary
  
Бейдж статуса в строке:
  - Padding: 4px 12px
  - Border-radius: --radius-sm (8px)
  - Шрифт: --text-small-medium (12px, 500)
  - Цвета по статусу (см. Status Colors)
```

### 6.6 Кнопки

```
Primary:
  - Фон: --accent-primary (#3B82F6)
  - Текст: белый, --text-body-medium (14px, 500)
  - Padding: 12px 32px
  - Border-radius: --radius-md (12px)
  - Hover: --accent-primary-hover (#2563EB), shadow --shadow-button
  - Active: scale(0.98)
  - Transition: all 0.2s ease
  - Min-width: 120px
  - Height: 44px

Secondary (outlined):
  - Фон: transparent
  - Border: 1.5px solid --border-light (#E2E8F0)
  - Текст: --text-primary-light, --text-body-medium
  - Padding: 10px 24px
  - Border-radius: --radius-md
  - Hover: фон #F8F9FA
  - Пример: "Войти через SSO"

Ghost/Text:
  - Фон: transparent
  - Текст: --text-link (#3B82F6), --text-body-medium
  - Padding: 8px 16px
  - Hover: text-decoration: underline
  - Пример: "Забыли пароль?"

Danger:
  - Фон: --status-error (#EE5D50)
  - Текст: белый
  - Те же размеры что primary

Tab-кнопка (pill):
  - Неактивная: фон transparent, текст --text-secondary-dark
  - Активная: фон белый, текст --text-primary-light
  - Border-radius: --radius-full (9999px)
  - Padding: 8px 20px
  - Border: 1px solid --border-light
  - Шрифт: --text-body-medium (14px, 500)
```

### 6.7 Поля ввода (Input Fields)

```
Контейнер:
  - Width: 100%
  
Label:
  - --text-body-medium (14px, 500)
  - Цвет: --text-primary-light (#1B2559) на светлом фоне
  - Цвет: --text-secondary-dark (#A3AED0) на тёмном фоне
  - Margin-bottom: 8px

Input:
  - Height: 48px
  - Padding: 12px 16px
  - Border: 1.5px solid --border-input (#E2E8F0)
  - Border-radius: --radius-md (12px)
  - Фон: белый (на светлом) / --bg-tertiary (на тёмном)
  - Текст: --text-body (14px), цвет --text-primary-light
  - Placeholder: --text-tertiary-light (#B0BBD5)
  - Focus: border-color --border-input-focus (#3B82F6), outline: none
  - Transition: border-color 0.2s ease

Search Input (в таблицах):
  - Иконка лупы слева: 20px, --text-tertiary-dark
  - Padding-left: 44px
  - На тёмном фоне: border --border-dark, фон --bg-tertiary
```

### 6.8 Модальное окно / Правая панель (Detail Panel)

```
Модальное окно (белый фон):
  - Фон: белый
  - Border-radius: --radius-xl (20px)
  - Padding: 32px
  - Shadow: --shadow-modal
  - Max-width: 560px (обычно) или 720px (широкое)
  - Overlay: rgba(0, 0, 0, 0.5)

  Заголовок модалки:
    - --text-h2 (22px, Bold), --text-primary-light
    - Кнопка закрытия: 24px, справа сверху, цвет --text-secondary-light
    - Margin-bottom: 24px

Правая боковая панель (slide-over):
  - Ширина: ~380-440px
  - Фон: белый или --bg-secondary (зависит от контекста)
  - Border-left: 1px solid --border-dark
  - Padding: 24px
  - Height: 100vh, position: fixed, right: 0
  - Shadow: -4px 0 24px rgba(0, 0, 0, 0.12)
```

### 6.9 Аватар

```
Большой (профиль):
  - 80x80px
  - Border-radius: --radius-full
  - Border: 3px solid --accent-primary
  
Средний (список, карточка):
  - 40x40px
  - Border-radius: --radius-full
  
Маленький (стек участников):
  - 28x28px
  - Border-radius: --radius-full
  - Border: 2px solid --bg-secondary (чтобы было видно наложение)
  - Margin-left: -8px (для стека)

Fallback (инициалы):
  - Фон: gradient от --accent-primary к --accent-secondary
  - Текст: белый, --text-body-medium (для среднего), --text-h3 (для большого)
  - Буквы: первые 2 символа имени и фамилии
```

### 6.10 Прогресс-бар

```
Контейнер:
  - Height: 8px
  - Background: --bg-tertiary (#1B254B) на тёмном / #E2E8F0 на светлом
  - Border-radius: --radius-full

Заполнение:
  - Height: 100%
  - Background: --accent-primary (#3B82F6) — обычный
  - Background: --status-success (#05CD99) — завершённый
  - Background: --status-warning (#FFCE20) — предупреждение
  - Border-radius: --radius-full
  - Transition: width 0.5s ease

Подпись:
  - --text-small (12px), справа от бара
  - Цвет: --text-secondary-dark
  - Формат: "67%"
```

### 6.11 Бейджи / Теги

```
Бейдж статуса:
  - Padding: 4px 12px
  - Border-radius: --radius-sm (8px)
  - Шрифт: --text-small-medium (12px, 500)
  - Варианты:
    • Завершён: bg --status-success-bg, text --status-success
    • В процессе: bg --status-warning-bg, text --status-warning
    • Отклонён: bg --status-error-bg, text --status-error
    • На рассмотрении: bg --status-pending-bg, text --status-pending
    • Новый: bg --accent-light (#E9EFFF), text --accent-primary

Тег/категория:
  - Padding: 4px 10px
  - Border-radius: --radius-full
  - Border: 1px solid --border-dark
  - Шрифт: --text-xs (10px, 500)
  - Цвет текста: --text-secondary-dark
```

### 6.12 Календарь

```
Контейнер:
  - Фон: --bg-secondary
  - Border-radius: --radius-lg
  - Padding: 24px

Заголовок месяца:
  - --text-h2 (22px, Bold), белый
  - Стрелки < >: 24px кнопки

Дни недели:
  - --text-small-medium (12px, 500)
  - Цвет: --text-secondary-dark
  - Text-align: center

Ячейка дня:
  - Размер: ~40x40px
  - Border-radius: --radius-sm
  - Текст: --text-body (14px)
  - Обычный: цвет белый
  - Сегодня: фон --accent-primary, текст белый, border-radius: --radius-full
  - С событием: точка 6px снизу, цвет --accent-primary
  - Другой месяц: цвет --text-tertiary-dark
  - Hover: фон --bg-tertiary
```

### 6.13 Рейтинг (радиальный прогресс)

```
Контейнер:
  - Фон: --bg-secondary
  - Border-radius: --radius-lg
  - Padding: 24px
  - Text-align: center

Круговой прогресс:
  - Размер: 120x120px
  - Stroke-width: 10px
  - Track: --bg-tertiary
  - Fill: gradient от --accent-primary к --status-success
  - Число внутри: --text-stat-big (34px, Bold), белый
  - Подпись: "Общий рейтинг", --text-small, --text-secondary-dark

Radar/Hexagon chart:
  - Размер: ~200x200px
  - Оси: --border-dark
  - Заливка: --accent-primary с 30% прозрачностью
  - Контур: --accent-primary, stroke-width 2px
  - Точки вершин: 6px, --accent-primary
  - Метки осей: --text-small, --text-secondary-dark
```

---

## 7. Лейаут (Layout)

### 7.1 Общая структура страницы

```
┌──────────────────────────────────────────────┐
│ Sidebar (280px fixed)  │  Content Area       │
│                        │                     │
│  Logo                  │  Page Header        │
│  Navigation            │  ┌──────────────┐   │
│  ...                   │  │ Main Content │   │
│                        │  │              │   │
│                        │  └──────────────┘   │
│  User block            │                     │
└──────────────────────────────────────────────┘

Content Area:
  - margin-left: 280px
  - padding: 32px
  - min-height: 100vh
  - background: --bg-primary
```

### 7.2 Page Header

```
Display: flex, justify-content: space-between, align-items: center
Margin-bottom: 32px

Левая часть:
  - Заголовок страницы: --text-h1 (28px, Bold), белый
  - Breadcrumb (опционально): --text-small, --text-secondary-dark

Правая часть:
  - Кнопки действий
  - Фильтры / Поиск
  - Notification bell: 24px, badge-count: 8px красный кружок
```

### 7.3 Сетка контента

```
Stat-карточки:
  - display: grid
  - grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))
  - gap: 20px
  - Margin-bottom: 24px

Двухколоночный layout:
  - display: grid
  - grid-template-columns: 1fr 1fr  или  2fr 1fr  или  3fr 2fr
  - gap: 24px

Список + детали:
  - grid-template-columns: 1fr 380px
  - или flex с фиксированной правой панелью
```

### 7.4 Страница логина (специальный layout)

```
Контейнер:
  - display: grid
  - grid-template-columns: 480px 1fr
  - min-height: 100vh
  - background: --bg-primary

Левая панель (форма):
  - Width: 480px
  - Background: белый
  - Border-radius: 0 24px 24px 0
  - Padding: 48px 40px
  - Display: flex, flex-direction: column, justify-content: center

Правая панель (промо):
  - Padding: 64px
  - Display: flex, flex-direction: column, justify-content: center
  - Фон: --bg-primary

  Feature cards (2×2 grid):
    - grid-template-columns: 1fr 1fr
    - gap: 24px
    - Каждая: иконка 40x40 в кружке + заголовок + описание

  Stats bar:
    - display: flex, gap: 64px
    - Margin-top: 48px
    - Каждый: число --text-stat-big + подпись --text-stat-label
    - Разделитель: 1px solid --border-dark между элементами
```

---

## 8. Анимации и переходы

```css
/* Базовые переходы */
--transition-fast: 0.15s ease;
--transition-base: 0.2s ease;
--transition-slow: 0.3s ease;

/* Ховеры */
Карточки: transform: translateY(-2px), box-shadow увеличивается
Кнопки: background-color + box-shadow
Строки таблиц: background-color
Sidebar items: background-color
Ссылки: color + text-decoration

/* Появление модалок */
Overlay: opacity 0→1, --transition-base
Модалка: opacity 0→1, transform translateY(10px)→translateY(0), --transition-slow
Правая панель: transform translateX(100%)→translateX(0), --transition-slow

/* Графики */
Линии: stroke-dashoffset анимация при появлении
Столбцы: scaleY(0)→scaleY(1) снизу вверх
Pie: stroke-dashoffset вращение
Числа: countUp анимация от 0 до значения
```

---

## 9. Адаптивность (Breakpoints)

```
Desktop (>1440px): Полный layout, sidebar + content
Laptop (1024-1440px): Sidebar сужается до 240px
Tablet (768-1024px): Sidebar скрывается в hamburger-меню
Mobile (<768px): Полностью мобильный layout, одна колонка

Примечание: Основной фокус макетов — desktop (1440px+).
Мобильную адаптацию реализовывать по логике компонентов.
```

---

## 10. Иконки

```
Библиотека: Lucide Icons (рекомендуется) или Heroicons
Размеры:
  - Sidebar: 20x20px
  - Кнопки: 18x18px
  - Карточки (feature): 24x24px
  - Большие иконки (промо): 28x28px
Стиль: outline (stroke-width: 1.5-2px)
Цвета: наследуют от текста или акцентный

Конкретные иконки (sidebar):
  - Преподаватели: Users
  - Проекты: FolderOpen / Briefcase
  - Аналитика: BarChart3 / PieChart
  - Расписание: Calendar
  - Отчёты: FileText
  - Личный кабинет: User
  - Заявки: Inbox / Mail
  - Мероприятия: CalendarDays
  - Рейтинг: Star / Trophy
  - Активность: Activity / TrendingUp
```

---

## 11. CSS-переменные (готовый блок для копирования)

```css
:root {
  /* Backgrounds */
  --bg-primary: #0B1437;
  --bg-secondary: #111C44;
  --bg-tertiary: #1B254B;
  --bg-surface: #192555;
  --bg-white: #FFFFFF;
  --bg-card-light: #F8F9FA;

  /* Accent */
  --accent-primary: #3B82F6;
  --accent-primary-hover: #2563EB;
  --accent-secondary: #4318FF;
  --accent-info: #3965FF;
  --accent-light: #E9EFFF;

  /* Status */
  --status-success: #05CD99;
  --status-success-bg: rgba(5, 205, 153, 0.1);
  --status-warning: #FFCE20;
  --status-warning-bg: rgba(255, 206, 32, 0.1);
  --status-error: #EE5D50;
  --status-error-bg: rgba(238, 93, 80, 0.1);
  --status-pending: #868CFF;
  --status-pending-bg: rgba(134, 140, 255, 0.1);

  /* Text on dark */
  --text-primary-dark: #FFFFFF;
  --text-secondary-dark: #A3AED0;
  --text-tertiary-dark: #707EAE;

  /* Text on light */
  --text-primary-light: #1B2559;
  --text-secondary-light: #A3AED0;
  --text-tertiary-light: #B0BBD5;
  --text-link: #3B82F6;

  /* Charts */
  --chart-blue: #4318FF;
  --chart-cyan: #05CD99;
  --chart-purple: #868CFF;
  --chart-orange: #FFB547;

  /* Borders */
  --border-dark: rgba(255, 255, 255, 0.1);
  --border-light: #E2E8F0;
  --border-input: #E2E8F0;
  --border-input-focus: #3B82F6;
  --border-divider: rgba(226, 232, 240, 0.1);

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.12);
  --shadow-modal: 0 8px 40px rgba(0, 0, 0, 0.24);
  --shadow-dropdown: 0 4px 16px rgba(0, 0, 0, 0.16);
  --shadow-button: 0 2px 8px rgba(59, 130, 246, 0.3);
  --shadow-light-card: 0 2px 12px rgba(0, 0, 0, 0.06);

  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.3s ease;

  /* Layout */
  --sidebar-width: 280px;
  --content-padding: 32px;
  --card-padding: 24px;
  --card-padding-sm: 16px;

  /* Typography */
  --font-family: 'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```
