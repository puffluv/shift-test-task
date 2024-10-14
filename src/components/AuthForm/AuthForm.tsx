import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import "./AuthForm.modules.css";

interface FormData {
  phone: string;
  otp: number;
}

const AuthForm = () => {
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [timer, setTimer] = useState(60);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<FormData>();

  useEffect(() => {
    if (isPhoneVerified && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else if (timer === 0) {
      setIsPhoneVerified(false);
    }
  }, [isPhoneVerified, timer]);

  const handlePhoneSubmit = async (data: FormData) => {
    try {
      const formattedPhone = data.phone.startsWith("+7")
        ? `8${data.phone.slice(2)}`
        : data.phone;

      await axios.post("https://shift-backend.onrender.com/auth/otp", {
        phone: formattedPhone,
      });
      console.log("OTP отправлен успешно");
      setIsPhoneVerified(true);
      setTimer(60);
    } catch (error) {
      console.error("Ошибка отправки OTP", error);
      setError("phone", { message: "Ошибка при отправке кода" });
    }
  };

  const handleOtpSubmit = async (data: FormData) => {
    try {
      const response = await axios.post(
        "https://shift-backend.onrender.com/users/signin",
        {
          phone: data.phone.startsWith("+7")
            ? `8${data.phone.slice(2)}`
            : data.phone,
          code: Number(data.otp),
        }
      );
      console.log("Авторизация успешна", response.data);
      reset();
      setIsPhoneVerified(false);
      setTimer(60);
    } catch (error) {
      console.error("Ошибка авторизации", error);
      setError("otp", { message: "Неверный код" });
    }
  };

  return (
    <div className="auth-form">
      <h2>Вход</h2>
      <p>Введите проверочный код для входа в личный кабинет</p>

      <form
        onSubmit={handleSubmit(
          isPhoneVerified ? handleOtpSubmit : handlePhoneSubmit
        )}
      >
        <div className="form-group">
          <input
            type="tel"
            placeholder="Телефон"
            {...register("phone", {
              required: "Поле является обязательным",
              pattern: {
                value: /^(\+7|8)[0-9]{10}$/,
                message: "Некорректный номер телефона",
              },
            })}
          />
          {errors.phone && (
            <span className="error">{errors.phone.message}</span>
          )}
        </div>

        {isPhoneVerified && (
          <>
            <div className="form-group">
              <input
                type="number"
                placeholder="Проверочный код"
                {...register("otp", {
                  required: "Код должен содержать 6 цифр",
                  valueAsNumber: true,
                  validate: (value) =>
                    (value >= 100000 && value <= 999999) ||
                    "Код должен содержать 6 цифр",
                })}
              />
              {errors.otp && (
                <span className="error">{errors.otp.message}</span>
              )}
            </div>
            <p className="timer-text">
              {timer > 0
                ? `Запросить код повторно можно через ${timer} секунд`
                : "Вы можете запросить код повторно"}
            </p>
          </>
        )}

        <button type="submit" className="submit-button">
          {isPhoneVerified ? "Войти" : "Продолжить"}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
