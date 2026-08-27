import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Input, message, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";
import { loginSchema } from "./loginSchema";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { useLogin } from "../../hooks/useLogin";

const { Title } = Typography;

const Login = () => {
  const { mutate, isPending } = useLogin();
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = (data) => {
    mutate(data, {
      onSuccess: (returnObject) => {
        localStorage.setItem("user", JSON.stringify(returnObject));
        navigate("/dashboard");
        message.success("Login successful", 2);
      },
      onError: (error) => {
        message.error(getLoginErrorMessage(error), 1.5);
      },
    });
  };
  const getLoginErrorMessage = (error) => {
    if (!error?.response) {
      return "Unable to connect to the server.";
    } else {
      return error.response?.data || "Login failed.";
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.login_card}>
        <Title level={2}>Login</Title>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter email"
                status={errors.email ? "error" : ""}
              />
            )}
          />
          <p>{errors.email?.message}</p>

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input.Password
                {...field}
                placeholder="Enter password"
                status={errors.password ? "error" : ""}
              />
            )}
          />
          <p>{errors.password?.message}</p>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Login
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login;
