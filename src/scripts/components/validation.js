// Проверка конкретного поля с учетом его типа
const validateFieldByType = (inputElement, errorMessage) => {
  // Для полей с pattern (имя, название карточки)
  if (inputElement.validity.patternMismatch) {
    return inputElement.dataset.errorMessage || errorMessage;
  }
  
  // Для полей URL (ссылки)
  if (inputElement.validity.typeMismatch && inputElement.type === 'url') {
    return 'Введите корректный URL';
  }
  
  // Стандартные сообщения
  if (inputElement.validity.valueMissing) {
    return 'Это обязательное поле';
  }
  
  if (inputElement.validity.tooShort) {
    return `Минимальная длина — ${inputElement.minLength} символа`;
  }
  
  if (inputElement.validity.tooLong) {
    return `Максимальная длина — ${inputElement.maxLength} символов`;
  }
  
  return errorMessage;
};

// Показать ошибку
const showInputError = (formElement, inputElement, errorMessage, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  
  inputElement.classList.add(settings.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(settings.errorClass);
};

// Скрыть ошибку
const hideInputError = (formElement, inputElement, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  
  inputElement.classList.remove(settings.inputErrorClass);
  errorElement.textContent = '';
  errorElement.classList.remove(settings.errorClass);
};

// Проверить валидность поля
const checkInputValidity = (formElement, inputElement, settings) => {
  if (!inputElement.validity.valid) {
    const errorMessage = validateFieldByType(inputElement, inputElement.validationMessage);
    showInputError(formElement, inputElement, errorMessage, settings);
  } else {
    hideInputError(formElement, inputElement, settings);
  }
};

// Проверить, есть ли невалидные поля
const hasInvalidInput = (inputList) => {
  return inputList.some((inputElement) => {
    return !inputElement.validity.valid;
  });
};

// Отключить кнопку отправки
const disableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.add(settings.inactiveButtonClass);
  buttonElement.disabled = true;
};

// Включить кнопку отправки
const enableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.remove(settings.inactiveButtonClass);
  buttonElement.disabled = false;
};

// Изменить состояние кнопки
const toggleButtonState = (inputList, buttonElement, settings) => {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(buttonElement, settings);
  } else {
    enableSubmitButton(buttonElement, settings);
  }
};

// Установить слушатели событий
const setEventListeners = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);
  
  // Делаем кнопку неактивной при загрузке
  toggleButtonState(inputList, buttonElement, settings);
  
  inputList.forEach((inputElement) => {
    inputElement.addEventListener('input', () => {
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(inputList, buttonElement, settings);
    });
  });
};

// Включить валидацию
export const enableValidation = (settings) => {
  const formList = Array.from(document.querySelectorAll(settings.formSelector));
  
  formList.forEach((formElement) => {
    formElement.addEventListener('submit', (evt) => {
      evt.preventDefault();
    });
    
    setEventListeners(formElement, settings);
  });
};

// Очистить валидацию
export const clearValidation = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);
  
  // Скрыть все ошибки
  inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, settings);
  });
  
  // Кнопка становится неактивной
  disableSubmitButton(buttonElement, settings);
};