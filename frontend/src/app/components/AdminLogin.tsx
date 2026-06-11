import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { login } from "../api/auth";
import type { AdminUser } from "../types/api";
import { toast } from "sonner";
import loginIllustration from "../../assets/login-illustration.png";

export function AdminLogin({ onLogin }: { onLogin: (user: AdminUser) => void }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const res = await login(username, password);
      toast.success("登录成功");
      onLogin(res.user);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "登录失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1EEFA] flex items-center justify-center p-4">
      <div className="w-full max-w-[360px] bg-white rounded-[18px] shadow-[0_10px_40px_rgba(109,63,224,0.12)] p-8 space-y-5">
        <div className="flex justify-center -mt-4">
          <img src={loginIllustration} alt="网球插图" className="w-32 h-32 object-contain" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-[#1F1A38]" style={{ fontSize: "20px", fontWeight: 600 }}>赛事后台管理</h2>
          <p className="text-[#6B6586]" style={{ fontSize: "12px" }}>北京市活力网球交流系列赛</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="u" style={{ fontSize: "13px" }}>用户名</Label>
            <Input id="u" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="请输入用户名" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p" style={{ fontSize: "13px" }}>密码</Label>
            <Input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="请输入密码" />
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-[#6D3FE0] hover:bg-[#5C32CE] text-white h-11 rounded-[12px]">
            {submitting ? "登录中..." : "登录"}
          </Button>
        </form>
      </div>
    </div>
  );
}
