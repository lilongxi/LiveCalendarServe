-- 先删除旧的表和类型，以便重新创建
DROP TABLE IF EXISTS public.appointments;
DROP TABLE IF EXISTS public.available_slots; -- 以防万一
DROP TABLE IF EXISTS public.founders;
DROP TABLE IF EXISTS public.partners;
DROP TYPE IF EXISTS public.appointment_status;

-- 1. 创建 partners 表
CREATE TABLE public.partners (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  share_link_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.partners IS '存储合伙人信息';

-- 2. 创建 founders 表
CREATE TABLE public.founders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.founders IS '存储创业者信息';

-- 3. 创建 available_slots 表 (可预约时间段)
CREATE TABLE public.available_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- 确保同一个合伙人的开始时间是唯一的
  CONSTRAINT unique_partner_start_time UNIQUE (partner_id, start_time)
);
COMMENT ON TABLE public.available_slots IS '合伙人定义的可预约时间段';

-- 4. 创建 appointments 表 (预约记录)
CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id uuid NOT NULL UNIQUE REFERENCES public.available_slots(id) ON DELETE RESTRICT,
  founder_id uuid NOT NULL REFERENCES public.founders(id) ON DELETE CASCADE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.appointments IS '存储已成功的预约记录';

-- 5. 创建索引以提高查询性能
CREATE INDEX idx_available_slots_partner_id ON public.available_slots(partner_id);
CREATE INDEX idx_appointments_founder_id ON public.appointments(founder_id);

-- 6. 开启 Row Level Security (RLS)
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.available_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 示例 RLS 策略 (您可以根据需要调整)
CREATE POLICY "Allow public read access" ON public.partners FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.founders FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.available_slots FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.appointments FOR SELECT USING (true);