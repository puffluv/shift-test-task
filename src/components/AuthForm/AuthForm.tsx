import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
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
    getValues,
  } = useForm<FormData>();

  useEffect(() => {
    if (isPhoneVerified && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPhoneVerified, timer]);

  const formatPhone = (phone: string) => {
    let cleanedPhone = phone.replace(/\D/g, "");
    return cleanedPhone.startsWith("8")
      ? `7${cleanedPhone.slice(1)}`
      : cleanedPhone;
  };

  const handlePhoneSubmit = async (data?: FormData) => {
    try {
      const phone = data ? data.phone : getValues("phone");
      const formattedPhone = formatPhone(phone);

      await axios.post("https://shift-backend.onrender.com/auth/otp", {
        phone: formattedPhone,
      });
      toast.success("Код отправлен успешно");
      setIsPhoneVerified(true);
      setTimer(60);
    } catch (error) {
      console.error("Ошибка отправки OTP", error);
      toast.error("Ошибка при отправке кода");
      setError("phone", { message: "Ошибка при отправке кода" });
    }
  };

  const handleOtpSubmit = async (data: FormData) => {
    try {
      const formattedPhone = formatPhone(data.phone);

      const response = await axios.post(
        "https://shift-backend.onrender.com/users/signin",
        {
          phone: formattedPhone,
          code: data.otp,
        }
      );
      toast.success("Авторизация успешна");
      console.log("Авторизация успешна", response.data);
      reset();
      setIsPhoneVerified(false);
      setTimer(60);
    } catch (error) {
      console.error("Ошибка авторизации", error);
      toast.error("Неверный код");
      setError("otp", { message: "Неверный код" });
    }
  };

  const handlePhoneInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value.replace(/[^\d+]/g, "");

    if (value.length > 1) {
      value = value.replace(/^(\d)(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3 $4");
    }

    event.target.value = value;
  };

  const handleOtpInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.value = event.target.value.replace(/\D/g, "");
  };

  return (
    <div className="auth-form">
      <Toaster position="top-left" reverseOrder={false} />
      <h2>Вход</h2>
      <p>
        Введите проверочный код для входа <br /> в личный кабинет
      </p>

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
                value: /^(\+7|8|7)[\s]?\d{3}[\s]?\d{3}[\s]?\d{4}$/,
                message: "Некорректный номер телефона",
              },
            })}
            onInput={handlePhoneInput}
          />
        </div>

        {isPhoneVerified && (
          <div className="form-group">
            <input
              type="text"
              placeholder="Проверочный код"
              {...register("otp", {
                required: "Код должен содержать 6 цифр",
                minLength: 6,
                maxLength: 6,
                pattern: {
                  value: /^\d{6}$/,
                  message: "Код должен содержать только 6 цифр",
                },
              })}
              onInput={handleOtpInput}
              maxLength={6}
            />
            {errors.otp && <span className="error">{errors.otp.message}</span>}
          </div>
        )}

        <button type="submit" className="submit-button">
          {isPhoneVerified ? "Войти" : "Продолжить"}
        </button>
      </form>
      {isPhoneVerified && (
        <p className="timer-text">
          {timer > 0
            ? `Запросить код повторно можно через ${timer} секунд`
            : null}
        </p>
      )}

      {isPhoneVerified && timer === 0 && (
        <a className="resend-link" onClick={() => handlePhoneSubmit()}>
          Запросить код ещё раз
        </a>
      )}
    </div>
  );
};

export default AuthForm;
