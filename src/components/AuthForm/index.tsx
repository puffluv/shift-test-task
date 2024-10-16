import { AppDispatch, RootState } from "@/store";
import { decrementTimer, resetStatus, startTimer } from "@/store/slice/auth";
import { sendPhone, sendOtp } from "@/store/thunks/auth";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import styles from "./AuthForm.module.css";
import { errorMessages } from "@/common/errors";

interface FormData {
  phone: string;
  otp: number;
}

const AuthForm = () => {
  const dispatch: AppDispatch = useDispatch();
  const { phone, isPhoneVerified, timer, status, error, user } = useSelector(
    (state: RootState) => state.auth
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<FormData>();

  useEffect(() => {
    if (isPhoneVerified && timer > 0) {
      const interval = setInterval(() => {
        dispatch(decrementTimer());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPhoneVerified, timer, dispatch]);

  useEffect(() => {
    if (status === "succeeded") {
      if (!isPhoneVerified) {
        toast.success("Регистрация успешна!");
        console.log("Авторизация успешна", user);
        reset();
      } else {
        toast.success("Код успешно отправлен");
        dispatch(startTimer());
      }
    } else if (status === "failed" && error) {
      toast.error(error);
    }
    return () => {
      dispatch(resetStatus());
    };
  }, [status, isPhoneVerified, error, dispatch, reset]);

  const handlePhoneSubmit = (data: FormData) => {
    const phone = data.phone;
    dispatch(sendPhone(phone));
  };

  const handleOtpSubmit = (data: FormData) => {
    const otpData = { phone, otp: data.otp };
    dispatch(sendOtp(otpData));
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
    <div className={styles.authForm}>
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
        <div className={styles.formGroup}>
          <input
            type="tel"
            placeholder="Телефон"
            {...register("phone", {
              required: errorMessages.requiredField,
              pattern: {
                value: /^(\+7|8|7)[\s]?\d{3}[\s]?\d{3}[\s]?\d{4}$/,
                message: errorMessages.incorrectPhone,
              },
            })}
            onInput={handlePhoneInput}
            readOnly={isPhoneVerified}
          />
        </div>

        {isPhoneVerified && (
          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="Проверочный код"
              {...register("otp", {
                required: errorMessages.requiredOtp,
                minLength: 6,
                maxLength: 6,
                pattern: {
                  value: /^\d{6}$/,
                  message: errorMessages.requiredOtp,
                },
              })}
              onInput={handleOtpInput}
              maxLength={6}
            />
            {errors.otp && (
              <span className={styles.error}>{errors.otp.message}</span>
            )}
          </div>
        )}

        <button type="submit" className={styles.submitButton}>
          {isPhoneVerified ? "Войти" : "Продолжить"}
        </button>
      </form>
      {isPhoneVerified && timer > 0 && (
        <p className={styles.timerText}>
          {timer > 0
            ? `Запросить код повторно можно через ${timer} секунд`
            : null}
        </p>
      )}

      {isPhoneVerified && timer === 0 && (
        <a
          className={styles.resendLink}
          onClick={() => handlePhoneSubmit(getValues())}
        >
          Запросить код ещё раз
        </a>
      )}
    </div>
  );
};

export default AuthForm;
