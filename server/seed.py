from datetime import datetime, timezone
from sqlalchemy.orm import Session

from models import Contract, Risk, Task


def _dt(s: str) -> datetime:
    return datetime.fromisoformat(s).replace(tzinfo=timezone.utc)


SEED_CONTRACTS = [
    Contract(
        id="1",
        name="软件开发服务合同",
        type="服务合同",
        party="科技有限公司",
        amount=500000,
        signed_date="2024-01-01",
        expiry_date="2024-12-31",
        status="active",
        ai_analyzed=True,
        risk_level="high",
        created_at=_dt("2024-01-01T00:00:00"),
        updated_at=_dt("2024-01-01T00:00:00"),
        content="""合同编号：SW-2024-001

甲方（委托方）：某某股份有限公司
乙方（受托方）：科技有限公司

鉴于甲方需要开发一套企业管理系统，乙方具备相应的软件开发能力，双方经友好协商，达成如下协议：

第一条 项目内容
1.1 乙方为甲方开发企业资源计划管理系统（ERP）。
1.2 系统功能包括：采购管理、库存管理、销售管理、财务管理、人力资源管理等模块。
1.3 开发周期为12个月，自合同签订之日起计算。

第二条 合同金额及支付方式
2.1 合同总金额为人民币伍拾万元整（¥500,000）。
2.2 付款方式：
    （1）合同签订后5个工作日内支付30%预付款；
    （2）系统上线试运行后支付40%；
    （3）验收合格后支付剩余30%。

第三条 双方权利义务
3.1 甲方应提供必要的业务需求文档和技术支持。
3.2 乙方应按照约定时间完成开发任务并交付使用。
3.3 乙方提供一年免费技术维护服务。

第四条 知识产权
4.1 系统源代码归甲方所有。
4.2 乙方保留技术框架的所有权。

第五条 违约责任
5.1 任何一方违约，应赔偿对方因此遭受的损失。
5.2 延期交付每日按合同金额的0.1%支付违约金。

第六条 争议解决
6.1 双方协商解决，协商不成提交甲方所在地仲裁委员会仲裁。""",
    ),
    Contract(
        id="2",
        name="办公设备采购合同",
        type="采购合同",
        party="办公设备公司",
        amount=120000,
        signed_date="2024-02-15",
        expiry_date="2024-03-15",
        status="completed",
        created_at=_dt("2024-02-15T00:00:00"),
        updated_at=_dt("2024-02-15T00:00:00"),
        content="""合同编号：CG-2024-003

甲方（采购方）：某某股份有限公司
乙方（供应方）：办公设备公司

第一条 采购清单
1.1 台式电脑 50台，单价5000元
1.2 笔记本电脑 20台，单价8000元
1.3 打印机 10台，单价3000元

第二条 交货时间
乙方应于2024年3月15日前将全部货物送达甲方指定地点。

第三条 付款方式
甲方在验收合格后30天内支付全部货款。""",
    ),
    Contract(
        id="3",
        name="房屋租赁合同",
        type="租赁合同",
        party="物业管理公司",
        amount=360000,
        signed_date="2024-01-01",
        expiry_date="2025-12-31",
        status="active",
        risk_level="low",
        created_at=_dt("2024-01-01T00:00:00"),
        updated_at=_dt("2024-01-01T00:00:00"),
        content="""合同编号：ZL-2024-002

甲方（出租方）：物业管理公司
乙方（承租方）：某某股份有限公司

第一条 租赁标的
甲方将位于市中心的办公楼第15层出租给乙方使用，面积500平方米。

第二条 租赁期限
租赁期两年，自2024年1月1日至2025年12月31日。

第三条 租金及支付方式
3.1 月租金为人民币壹万伍仟元整（¥15,000）。
3.2 租金按季度支付，每季度首月5日前支付。

第四条 押金
乙方应于签约时支付两个月租金作为押金。""",
    ),
]

SEED_RISKS = [
    Risk(
        id="1",
        contract_id="1",
        contract_name="软件开发服务合同",
        type="operational",
        level="high",
        description="开发进度延迟，可能无法按期交付ERP系统",
        suggestion="建议增加开发资源投入，制定详细的里程碑计划，每两周进行一次进度评审",
        clause="1.3 开发周期为12个月，自合同签订之日起计算。",
        status="pending",
        created_at=_dt("2024-06-15T00:00:00"),
    ),
    Risk(
        id="2",
        contract_id="1",
        contract_name="软件开发服务合同",
        type="financial",
        level="medium",
        description='第二笔款项支付条件模糊，"上线试运行"标准未明确定义',
        suggestion="建议补充试运行验收标准附件，明确上线试运行的具体指标和验收流程",
        clause="（2）系统上线试运行后支付40%；",
        status="processing",
        assigned_to="张明",
        assigned_department="finance",
        created_at=_dt("2024-08-20T00:00:00"),
    ),
    Risk(
        id="3",
        contract_id="3",
        contract_name="房屋租赁合同",
        type="legal",
        level="low",
        description="房东有意涨租，续约谈判存在不确定性",
        suggestion="建议提前6个月启动续约谈判，同时考察备选办公场地作为谈判筹码",
        status="pending",
        created_at=_dt("2025-10-01T00:00:00"),
    ),
    Risk(
        id="4",
        contract_id="1",
        contract_name="软件开发服务合同",
        type="legal",
        level="high",
        description='知识产权条款存在争议风险，"技术框架所有权"边界不清',
        suggestion='建议明确"技术框架"的定义和范围，通过附件形式列出乙方保留权利的具体技术组件清单',
        clause="4.2 乙方保留技术框架的所有权。",
        status="pending",
        created_at=_dt("2024-03-10T00:00:00"),
    ),
]

SEED_TASKS = [
    Task(
        id="1",
        title="审核软件开发合同变更条款",
        description="甲方提出需求变更，需审核新增模块的合同补充条款",
        type="review",
        priority="high",
        status="pending",
        assignee="李律师",
        due_date="2024-07-15",
        contract_id="1",
        contract_name="软件开发服务合同",
        created_at=_dt("2024-07-01T00:00:00"),
    ),
    Task(
        id="2",
        title="办公设备验收确认",
        description="核实50台台式电脑、20台笔记本电脑和10台打印机到货情况",
        type="approval",
        priority="medium",
        status="processing",
        assignee="王经理",
        due_date="2024-03-20",
        contract_id="2",
        contract_name="办公设备采购合同",
        created_at=_dt("2024-03-10T00:00:00"),
    ),
    Task(
        id="3",
        title="租赁合同续约准备",
        description="收集市场租金数据，准备续约谈判方案",
        type="review",
        priority="medium",
        status="pending",
        assignee="陈主管",
        due_date="2025-06-30",
        contract_id="3",
        contract_name="房屋租赁合同",
        created_at=_dt("2025-01-15T00:00:00"),
    ),
    Task(
        id="4",
        title="ERP系统第一阶段验收签署",
        description="组织业务部门完成ERP采购和库存模块的验收测试",
        type="sign",
        priority="high",
        status="pending",
        assignee="张总监",
        due_date="2024-06-30",
        contract_id="1",
        contract_name="软件开发服务合同",
        created_at=_dt("2024-06-01T00:00:00"),
    ),
    Task(
        id="5",
        title="采购合同归档",
        description="办公设备采购合同已履约完毕，整理相关文档归档",
        type="archive",
        priority="low",
        status="completed",
        assignee="刘助理",
        due_date="2024-04-30",
        contract_id="2",
        contract_name="办公设备采购合同",
        created_at=_dt("2024-04-01T00:00:00"),
        completed_at=_dt("2024-04-15T00:00:00"),
    ),
]


def seed_database(db: Session) -> None:
    if db.query(Contract).count() > 0:
        return
    for c in SEED_CONTRACTS:
        db.merge(c)
    for r in SEED_RISKS:
        db.merge(r)
    for t in SEED_TASKS:
        db.merge(t)
    db.commit()
