package graph

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"reflect"
	"strconv"
	"testing"
	"time"

	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/integrations"
	kafka_queue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/parser"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	publicModel "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/storage"
	"github.com/highlight-run/highlight/backend/store"
	"github.com/highlight-run/highlight/backend/util"

	"github.com/aws/smithy-go/ptr"
	"github.com/go-test/deep"
	"github.com/openlyinc/pointy"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"

	_ "gorm.io/driver/postgres"

	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

var vector = model.Vector{-0.01658022, -0.02071132, -0.03327209, -0.03441652, -0.029392209, 0.021227706, -0.019720415, -0.02526111, -0.020153062, -0.03430487, 0.021311445, -0.013132986, 0.012525882, -0.018924898, -0.02051593, 0.0118001485, 0.016915174, -0.009392667, 0.002576703, -0.02071132, -0.007341074, 0.014961276, -0.0060501057, 0.008094721, -0.005987302, -0.041059773, -0.011904822, -0.03405365, 0.005582566, -0.0061408225, 0.0038833723, 0.003300692, -0.02304204, -0.022958303, -0.015561402, -0.023125779, 0.004309043, -0.019050505, 0.015379969, 0.025526281, 0.013460962, -0.0027162672, 0.009155408, 0.0035362064, -0.028778126, 0.019008636, 0.0045916606, -0.0043299776, -0.0032413772, 0.033523306, -0.004040382, -0.0035902876, -0.049796488, -0.015003146, -0.0021004404, -0.008443631, 0.004302065, 0.018115425, 0.01919007, -0.01973437, 0.020460105, -0.010941829, -0.03581216, -0.022455871, -0.012825945, -0.008701825, 0.011625693, 0.0053662416, 0.0026482297, -0.001387791, 0.03078785, -0.027117314, 0.0087506715, -0.0057360865, 0.012742206, -0.009399645, -0.0021370759, 0.0009533976, -0.014821712, -0.010802265, -0.0038903505, -0.008450609, -0.036454156, 0.043767314, -0.0076341587, 0.00502082, 0.023363037, 0.008722759, -0.0036844935, -0.0012508436, 0.018966768, 0.024381856, 0.02689401, -0.01607779, -0.0017148944, 0.012972487, -0.007703941, 0.020962534, 0.020697363, -0.017933993, -0.010578962, 0.0087506715, -0.0139215235, -0.0076341587, -0.030564548, -0.010467311, 0.003701939, 0.017766517, -0.004309043, -0.024200423, -0.005516273, 0.007578333, -0.02101836, -0.023014128, -0.016189441, -0.017766517, 0.01958085, -0.005289481, -0.012672424, -0.005153406, 0.0221907, -0.016091745, 0.019622719, -0.020781102, -0.0020603158, -0.022386089, -0.031318195, -0.023209518, 0.020962534, 0.0062768976, 0.025023852, 0.008980953, -0.003771721, -0.0038484812, -0.019901847, 0.025986845, -0.01339118, 0.00030137133, -0.0034681691, -0.026810272, -0.0036810043, 0.019273808, 0.014235543, 0.0232793, -0.022665218, 0.019176114, -0.023935251, -0.0075504202, 0.01623131, 0.017445518, -0.0029360808, 0.008541326, -0.0026307842, -0.037654407, -0.0056349025, 0.012142081, -0.0052092317, 0.014361151, -0.02541463, -0.017920036, -0.0010650489, 0.040194474, 0.017626952, 0.00276337, 0.00821335, 0.03332792, -0.004002002, -0.018380597, -0.025442544, -0.009267059, -0.0065002, 0.0094415145, 0.0016398787, -0.0067130355, 0.035672594, 0.02378173, -0.018938854, 0.011346565, -0.018980723, -0.012672424, -0.0054430016, 0.018855115, 0.017682778, 0.031541497, -0.012749185, 0.002646485, -0.02456329, -9.7258766e-05, 0.026363667, 0.002697077, -0.021576617, 0.0070165875, -0.009294972, 0.014458845, -0.61676186, -0.00833198, 0.0056104786, -0.0032064863, 0.01393548, -0.0021876679, -0.01008351, -0.005987302, -0.022427958, 0.012246754, 0.0052511008, 0.036761194, -0.021520792, -0.018589944, -0.012798032, -0.0029674827, 0.02117188, -0.032490533, 0.0019573872, 0.009246125, -0.012895727, 0.003953154, -0.010425442, -0.0008304067, 0.005191786, -0.024800548, 0.029057255, -0.022232568, 0.0065106675, -0.010425442, -0.016733741, 0.025470456, 0.009050735, -0.003974089, 0.052420292, -0.0014270433, -0.043264885, 0.0028279184, -0.014779843, 0.058840245, -0.029475948, 0.003600755, 0.047228508, 0.0061722244, -0.020934623, 0.011255848, 0.0016529629, 0.007676028, -0.0033443058, -0.008632042, 0.027605789, -0.008932105, -0.014514671, 0.019678544, 0.02401899, 0.012658468, 0.010132357, -0.015938226, -0.011116284, -0.00061626296, 0.00010271049, 0.0023307211, -0.013356289, -0.019901847, -0.0060780183, 0.0071596405, -0.0007318395, -0.00860413, 0.0021597552, -0.05378802, 0.0180596, 0.00840874, -0.004951038, 0.030341245, 0.010223074, 0.020418234, 0.030201681, -0.0014331493, -0.03028542, -0.02230235, -0.014270434, -0.011297718, -0.019399416, 0.0032274208, 0.027536007, -0.006740948, -0.025079677, -0.026907967, 0.006426929, 0.015812617, 0.009176343, -0.024884287, -0.013132986, 0.0070793913, 0.016608134, -3.8536878e-06, 0.005659326, -0.009622948, -0.017654864, -0.014486758, -0.013328376, 0.014821712, 0.0191482, 0.0018213121, 0.053397242, 0.0011365755, -0.011821083, -0.0070130983, 0.00022090388, -0.012860836, -0.002016702, -0.00029984483, -0.014151804, 0.009950924, 0.0014994423, -0.033104617, 0.01494732, -0.0050382656, 0.017291998, 0.0034158325, -0.0038973289, 0.013300463, -0.003834525, 0.0018649258, -0.012463078, 0.009406623, -0.0015971372, -0.009127495, -0.002206858, 0.010830178, 0.015449751, -0.0017916547, 0.024088772, 0.006866556, -0.006259452, 0.0137540465, 0.013991306, 0.0043753358, 0.001403492, 0.030871589, 0.012267688, -0.0022871075, -0.01179317, 0.0036565806, 0.010802265, -0.04332071, 0.0039252415, -0.008687868, 0.005959389, 0.017640907, -0.0040613166, -0.0022975747, 0.0043962705, 0.030229595, -0.0102998335, -0.010851112, 0.023530515, -0.023363037, 0.01393548, -0.015128753, 0.007808614, 0.05088509, -0.019162158, -0.003433278, 0.006262941, 0.009860207, 0.023879426, 0.013230681, -0.018115425, -0.026614882, 0.015310187, -0.024926156, 0.0012560773, -0.00048542154, 0.027019618, 0.022232568, -0.02071132, 0.0014270433, -0.015086884, -0.00065420696, 0.02090671, 0.005858205, 0.0011976348, 0.00019996925, 0.012588686, 0.029810902, 0.011416347, 0.019901847, -0.02841526, 0.041952983, -0.034193214, 0.0076550934, -0.031429846, -0.0026063605, -0.0011758279, 0.005045244, 0.01327255, 0.012539838, -0.016901217, 0.011423325, -0.007976091, 0.010892982, 0.01766882, 0.015519533, -0.010411485, -0.038045187, -0.032043926, -0.04172968, 0.012016473, 0.011730366, 0.03059246, -0.012295601, -0.010844134, -0.005348796, 0.00525459, 0.0070200767, -0.026112452, 0.0007519018, -0.023991076, 0.014361151, 0.0023446777, -0.0084645655, 0.016063834, -0.018017732, 0.009909054, -0.016217353, 0.03366287, 0.016008008, 0.016705828, 0.016831435, 0.0024005033, 0.028512955, 0.0030355202, -0.026963793, 0.0026133386, -0.008457587, 0.0076620714, -0.008304067, 0.027117314, -0.007142195, 0.00064504804, -0.0049266145, 0.017473431, -0.014472802, 0.01514271, 0.007341074, 0.029727163, 0.016622089, -0.010934851, 0.045916606, -0.0040264255, 0.012798032, 0.001169722, -0.014172739, -0.0005412472, -0.003604244, -0.005390665, 0.013802894, 0.030201681, 0.029224733, 0.016984956, 0.014933364, 0.016063834, 0.018562032, 0.036454156, 0.00043613795, -0.03276966, -0.014082022, 0.004448607, -0.016398787, 0.017585082, 0.0016861093, 0.010257965, -0.013761025, -0.013719155, -0.008073786, 0.0013581336, -0.012525882, 0.012791054, 0.020432191, -0.025400674, -0.024437683, 0.05130378, 0.015631184, -0.0022522165, -0.003600755, 0.010851112, 0.007299205, -0.017291998, 0.014005262, 0.0067863064, 0.006974718, -0.0052406336, -0.034891035, 0.030899502, -0.012497969, 0.027452268, -0.01988789, -0.019329634, -0.019790195, 0.005422067, -0.0065734712, 0.009050735, 0.023809643, 0.035867985, 0.026935881, -0.014186695, -0.03818475, 0.029755076, -0.03424904, 0.024465594, -0.00036810045, 0.004814963, 0.031039067, -0.011507064, 0.022595435, -0.013084139, -0.021325402, 0.019287765, 0.00084959675, 0.00038489175, -0.02752205, -0.0018666704, 0.005889607, 0.043041583, 0.017389692, -0.02265126, -0.0054778927, -0.019999541, 0.025428588, -0.03475147, -0.025428588, 0.0028488531, -0.008150546, -0.0021266087, -0.005390665, 0.016021963, 0.007375965, 0.045274608, -0.019720415, 0.01646857, -0.0064059943, -0.021520792, -0.01475193, -0.007955156, -0.022860607, -0.01327255, 0.051471256, 0.02086484, 0.017333867, 0.018673683, -0.011611737, 0.012058342, -0.0005137705, 0.01459841, 0.0069188927, -0.009043757, 0.00420437, 0.020362409, 0.049489446, 0.010802265, 0.013293485, 0.029699251, 0.021478921, 0.020013498, 0.027368529, -0.020194931, -0.0034611907, 0.005181319, -0.028233826, -0.03441652, 0.02919682, 0.025735628, -0.0003177265, -0.005156895, 0.034779385, -0.022735, 0.004884745, 0.035867985, 0.016091745, 0.02071132, -0.02713127, -0.019664587, -0.027843047, -0.011311674, -0.0137540465, 0.003834525, -0.0065420694, -0.024842419, -0.030564548, -0.012442144, 0.007738832, -0.031988103, 0.0027459245, 0.0045637474, -0.0072573354, -0.00447652, 0.021241663, 0.013907567, 0.005997769, 0.024381856, -0.008806498, 0.012190928, 0.0099299885, -0.023195561, -0.010453355, 0.022637304, -0.0072573354, -0.022232568, -0.021632442, -0.0064478633, 0.0013528999, 0.007208488, 0.010306812, -0.009839272, 0.021269577, 0.01638483, -0.01475193, 0.026168277, 0.008024938, 0.0034071098, 0.037291538, 0.0123723615, 0.02253961, -0.011981582, -0.022260481, -0.011179088, 0.021897614, 0.005921009, 0.014305325, 0.0022330263, 0.030759938, -0.019273808, -9.1452675e-06, 0.023851512, -0.013216725, 0.0002168696, -0.012358405, 0.010578962, 0.0067863064, 6.5747794e-05, 0.039803695, 0.0043544015, -0.0045218784, 0.009671795, -0.028443173, 0.019762283, 0.014821712, -0.02066945, 0.006301321, -0.003164617, -0.03039707, -0.021046273, -0.0015831807, -0.013830807, 0.0127770975, -0.007899331, -0.022972258, -0.028526912, -0.030341245, -0.006430418, 0.0009708431, -0.008645999, -0.028889779, -0.03628668, 0.0040892293, -0.0024476063, -0.012518904, 0.00083607645, -0.02191157, 0.01218395, -0.021492878, -0.016370874, 0.023865469, -0.006493222, 0.018617857, 0.0037577646, -0.017836297, -0.0067897956, -0.014863581, -0.019078419, 0.009902076, 0.021534748, 0.023307212, 0.03768232, -0.005962878, 0.019162158, -0.015212492, 0.018617857, -0.025163416, 0.0021370759, 0.007096837, -0.0054395124, 0.014333238, 0.009246125, 0.0016259223, 0.036091287, -0.022804782, 0.011772236, 0.026712578, -0.0060780183, 0.005313905, -0.028722301, -0.031597324, -0.021102099, 0.009874163, -0.0019626208, 0.009092604, -0.021227706, 0.014905451, 0.0018230566, -0.0061024423, 0.011151175, -0.03327209, 0.04410227, 0.001953898, 0.0045951493, -0.0029046787, 0.036956586, -0.010571984, 0.0062768976, -0.007836527, -0.017543213, 0.0039845565, 0.0024127152, 0.021813875, -0.013419093, 0.002993651, 0.003904307, 0.04912658, -0.011660584, 0.0049475487, -0.0057744663, -0.027926786, -0.0023307211, -0.021074185, -0.0131469425, -0.0023621232, -0.012044386, 0.003433278, -0.005861694, 0.020599667, -0.021576617, -0.041115597, -0.0032745237, -0.041199334, 0.028429216, 0.011960647, 0.028471086, 0.023600297, 0.017724646, 0.01023703, 0.009664817, -0.01786421, -0.011555911, 0.034500256, 0.025037808, -0.0012691615, -0.015742837, -0.0050487327, 0.0070584565, -0.024730766, -0.033216268, 0.028512955, -0.0025330891, 0.010879025, -0.0054081106, -0.007403878, -0.031206543, 0.0053522848, 0.0030913458, 0.01899468, 0.012316536, -0.011534977, -0.0071805753, 0.023209518, -0.009895097, 0.033216268, 0.023139736, 0.00034411284, 0.004717268, -0.014158783, 0.00088884914, 0.018938854, -0.01997163, 0.021785963, 0.00840874, 0.005687239, 0.009183321, 0.017180346, -0.018645769, -0.010362638, 0.011130241, 0.023893382, 0.0008304067, -0.023879426, -0.013795916, -0.004919636, -0.0056383917, 0.010788308, -0.00801796, -0.030062117, -0.010565006, 0.0025836811, 0.011632672, 0.012902705, 0.0041834353, -0.0029186353, -0.013698221, 0.0090367785, 0.0028837442, 0.005687239, -0.007885374, -0.0032954584, -0.028666476, -0.029085169, -0.032741748, 0.020390322, 0.023865469, -0.0036147113, 0.0062838756, 0.028889779, -0.03028542, 0.015477664, -0.006726992, 0.0028523423, -0.011534977, -0.01677561, -0.008632042, -0.0061861807, 0.0024772636, -0.010599897, -0.032685924, -0.0033041812, 0.0011897844, 0.018227078, 0.023111822, 0.011339587, 0.048624147, 0.002027169, -0.010969742, -0.013126008, -0.034360692, 0.033355832, -0.007836527, 0.023795687, -0.006964251, 0.0191482, -6.972755e-05, -0.0068211975, 0.019566894, 0.0012543327, 0.004043871, -0.012281645, -0.01062781, 0.028973516, -0.016356917, -0.031094892, -0.017236171, -0.015896356, -0.0069363383, -0.00039666746, 0.020934623, 0.03134611, 0.00988812, -0.017347824, 0.024940113, 0.02214883, -0.007236401, -0.039496653, -0.052531943, 0.018659726, -0.008185437, -0.019497111, -0.009685752, 0.014305325, 0.009741577, -0.032741748, -0.030173767, -0.02347469, -0.01564514, 0.0003170723, -0.022372132, 0.0049963966, 0.06615341, 0.00050984527, -0.007009609, -0.0056104786, -0.026531145, 0.015226448, -0.0031279814, -0.01817125, 0.0040892293, -0.02471681, 0.0164267, -0.01658022, -0.03235097, 0.00548836, -0.013865698, 0.016217353, 0.012079277, 0.029140994, 0.016412744, -0.0005948922, -0.009636904, 0.01743156, -0.0021318423, 0.017989818, -0.0031855516, -0.034081563, 0.014668192, 0.023181604, 0.0013912801, -0.0042881086, 0.014807756, 0.032127667, -0.016105702, -0.0022591946, -0.0059349653, -0.011981582, -0.026614882, -0.0053697303, 0.009943945, 0.00895304, 0.014172739, 0.019525023, -0.00914843, 0.001631156, -0.0077946577, 0.0010231796, -0.018436424, 0.009546188, -0.015938226, -0.046726074, -0.023600297, -0.013091117, -0.009260081, -0.02179992, 0.005854716, -0.018436424, -0.00352225, -0.021464966, 0.0029988845, -0.013433049, -0.00478705, -0.0025714694, -0.007096837, -0.003168106, 0.008387805, -0.024479551, -0.035672594, -0.044465136, 0.0044904766, 0.00039623133, -0.017180346, -0.05348098, -2.8212675e-05, 0.0007867929, 0.011730366, 0.011814105, 0.17484596, 0.007871418, -0.0030913458, -0.005383687, 0.013579591, 0.019608762, -0.009008866, -0.0008500329, -0.033188354, 0.010851112, -0.005931476, 0.021409139, 0.0019399417, -0.002981439, 0.00961597, 0.0062106047, -0.04251124, -0.005188297, -0.020655494, -0.033383742, 0.010655723, 0.023656122, 0.00089102983, -0.020920666, 0.040194474, -0.0154218385, -0.0060710404, 0.018394554, 0.012714294, 0.013209746, -0.024842419, 0.008004004, 0.02086484, -0.016105702, -0.011479151, -0.014389063, 0.00829011, 0.011416347, 0.005886118, 0.013181834, 0.012037408, 0.01023703, -0.0021457986, -0.041841332, -0.012267688, -0.0062768976, 0.0024353943, -0.004410227, 0.032741748, 0.028317565, -0.019650633, -0.0019992564, 0.03304879, 0.008401762, -0.009462449, -0.007271292, 0.019469198, -0.01183504, -0.014214608, 0.025051763, -0.012030429, 0.01455654, -0.01997163, 0.0020934623, -0.034221128, 0.02787096, -0.0021370759, 0.010153292, 0.0065106675, 0.005041755}

var resolver *Resolver

type mockEmbeddingsClient struct{}

func (c *mockEmbeddingsClient) GetEmbeddings(ctx context.Context, errors []*model.ErrorObject) ([]*model.ErrorObjectEmbeddings, error) {
	var vec []float32
	vec = append(vec, vector...)
	vec[0] += 0.01
	return []*model.ErrorObjectEmbeddings{
		{
			ErrorObjectID:     1,
			GteLargeEmbedding: vec,
		},
	}, nil
}

func (c *mockEmbeddingsClient) GetErrorTagEmbedding(ctx context.Context, title string, description string) (*model.ErrorTag, error) {
	var vec []float32
	vec = append(vec, vector...)
	vec[0] += 0.01

	errorTag := &model.ErrorTag{
		Title:       title,
		Description: description,
		Embedding:   vec,
	}

	return errorTag, nil
}

func (c *mockEmbeddingsClient) GetStringEmbedding(ctx context.Context, input string) ([]float32, error) {
	var vec []float32
	vec = append(vec, vector...)
	vec[0] += 0.01

	return vec, nil
}

// Gets run once; M.run() calls the tests in this file.
func TestMain(m *testing.M) {
	testLogger := log.WithContext(context.TODO())
	var err error
	db, err := util.CreateAndMigrateTestDB("highlight_testing_db")
	if err != nil {
		testLogger.Error(e.Wrap(err, "error creating testdb"))
	}

	chClient, err := clickhouse.NewClient(clickhouse.TestDatabase)
	if err != nil {
		testLogger.Error(e.Wrap(err, "error creating clickhouse client"))
	}

	redisClient := redis.NewClient()
	resolver = &Resolver{
		DB:               db,
		Redis:            redisClient,
		Clickhouse:       chClient,
		StorageClient:    &storage.FilesystemClient{},
		Store:            store.NewStore(db, redisClient, integrations.NewIntegrationsClient(db), &storage.FilesystemClient{}, &kafka_queue.MockMessageQueue{}, nil),
		EmbeddingsClient: &mockEmbeddingsClient{},
		DataSyncQueue:    &kafka_queue.MockMessageQueue{},
		TracesQueue:      &kafka_queue.MockMessageQueue{},
	}
	code := m.Run()
	os.Exit(code)
}

func TestProcessBackendPayloadImpl(t *testing.T) {
	trpcTraceStr := "[{\"columnNumber\":11,\"lineNumber\":80,\"fileName\":\"/workspace/src/trpc/instance.ts\",\"source\":\"    at /workspace/src/trpc/instance.ts:80:11\",\"lineContent\":\"    throw new TRPCError({\\n\",\"linesBefore\":\"        organizationId,\\n        supabaseAccessToken,\\n      },\\n    });\\n  } catch (error) {\\n\",\"linesAfter\":\"      code: \\\"UNAUTHORIZED\\\",\\n    });\\n  }\\n});\\n\\n\"},{\"columnNumber\":38,\"lineNumber\":421,\"fileName\":\"/workspace/node_modules/@trpc/server/dist/index.js\",\"functionName\":\"callRecursive\",\"source\":\"    at callRecursive (/workspace/node_modules/@trpc/server/dist/index.js:421:38)\",\"lineContent\":\"                const result = await middleware({\\n\",\"linesBefore\":\"            ctx: opts.ctx\\n        })=\u003e{\\n            try {\\n                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion\\n                const middleware = _def.middlewares[callOpts.index];\\n\",\"linesAfter\":\"                    ctx: callOpts.ctx,\\n                    type: opts.type,\\n                    path: opts.path,\\n                    rawInput: opts.rawInput,\\n                    meta: _def.meta,\\n\"},{\"columnNumber\":30,\"lineNumber\":449,\"fileName\":\"/workspace/node_modules/@trpc/server/dist/index.js\",\"functionName\":\"resolve\",\"source\":\"    at resolve (/workspace/node_modules/@trpc/server/dist/index.js:449:30)\",\"lineContent\":\"        const result = await callRecursive();\\n\",\"linesBefore\":\"                    marker: middlewareMarker\\n                };\\n            }\\n        };\\n        // there's always at least one \\\"next\\\" since we wrap this.resolver in a middleware\\n\",\"linesAfter\":\"        if (!result) {\\n            throw new TRPCError.TRPCError({\\n                code: 'INTERNAL_SERVER_ERROR',\\n                message: 'No result from middlewares - did you forget to `return next()`?'\\n            });\\n\"},{\"columnNumber\":12,\"lineNumber\":228,\"fileName\":\"/workspace/node_modules/@trpc/server/dist/config-7b65d7da.js\",\"functionName\":\"Object.callProcedure\",\"source\":\"    at Object.callProcedure (/workspace/node_modules/@trpc/server/dist/config-7b65d7da.js:228:12)\",\"lineContent\":\"    return procedure(opts);\\n\",\"linesBefore\":\"            code: 'NOT_FOUND',\\n            message: `No \\\"${type}\\\"-procedure on path \\\"${path}\\\"`\\n        });\\n    }\\n    const procedure = opts.procedures[path];\\n\",\"linesAfter\":\"}\\n\\n/**\\n * The default check to see if we're in a server\\n */ const isServerDefault = typeof window === 'undefined' || 'Deno' in window || globalThis.process?.env?.NODE_ENV === 'test' || !!globalThis.process?.env?.JEST_WORKER_ID;\\n\"},{\"columnNumber\":45,\"lineNumber\":125,\"fileName\":\"/workspace/node_modules/@trpc/server/dist/resolveHTTPResponse-83d9b5ff.js\",\"source\":\"    at /workspace/node_modules/@trpc/server/dist/resolveHTTPResponse-83d9b5ff.js:125:45\",\"lineContent\":\"                const output = await config.callProcedure({\\n\",\"linesBefore\":\"        };\\n        const inputs = getInputs();\\n        const rawResults = await Promise.all(paths.map(async (path, index)=\u003e{\\n            const input = inputs[index];\\n            try {\\n\",\"linesAfter\":\"                    procedures: router._def.procedures,\\n                    path,\\n                    rawInput: input,\\n                    ctx,\\n                    type\\n\"},{\"columnNumber\":52,\"lineNumber\":122,\"fileName\":\"/workspace/node_modules/@trpc/server/dist/resolveHTTPResponse-83d9b5ff.js\",\"functionName\":\"Object.resolveHTTPResponse\",\"source\":\"    at Object.resolveHTTPResponse (/workspace/node_modules/@trpc/server/dist/resolveHTTPResponse-83d9b5ff.js:122:52)\",\"lineContent\":\"        const rawResults = await Promise.all(paths.map(async (path, index)=\u003e{\\n\",\"linesBefore\":\"                input[k] = value;\\n            }\\n            return input;\\n        };\\n        const inputs = getInputs();\\n\",\"linesAfter\":\"            const input = inputs[index];\\n            try {\\n                const output = await config.callProcedure({\\n                    procedures: router._def.procedures,\\n                    path,\\n\"},{\"columnNumber\":5,\"lineNumber\":96,\"fileName\":\"node:internal/process/task_queues\",\"functionName\":\"processTicksAndRejections\",\"source\":\"    at processTicksAndRejections (node:internal/process/task_queues:96:5)\"},{\"columnNumber\":20,\"lineNumber\":53,\"fileName\":\"/workspace/node_modules/@trpc/server/dist/nodeHTTPRequestHandler-e6a535cb.js\",\"functionName\":\"Object.nodeHTTPRequestHandler\",\"source\":\"    at Object.nodeHTTPRequestHandler (/workspace/node_modules/@trpc/server/dist/nodeHTTPRequestHandler-e6a535cb.js:53:20)\",\"lineContent\":\"    const result = await resolveHTTPResponse.resolveHTTPResponse({\\n\",\"linesBefore\":\"        method: opts.req.method,\\n        headers: opts.req.headers,\\n        query,\\n        body: bodyResult.ok ? bodyResult.data : undefined\\n    };\\n\",\"linesAfter\":\"        batching: opts.batching,\\n        responseMeta: opts.responseMeta,\\n        path,\\n        createContext,\\n        router,\\n\"}]"
	util.RunTestWithDBWipe(t, resolver.DB, func(t *testing.T) {
		workspace := model.Workspace{}
		resolver.DB.Create(&workspace)

		project := model.Project{WorkspaceID: workspace.ID}
		resolver.DB.Create(&project)

		resolver.ProcessBackendPayloadImpl(context.Background(), nil, ptr.String(project.VerboseID()), []*publicModel.BackendErrorObjectInput{{
			SessionSecureID: nil,
			RequestID:       nil,
			TraceID:         nil,
			SpanID:          nil,
			LogCursor:       new(string),
			Event:           "dummy event",
			Type:            "",
			URL:             "",
			Source:          "",
			StackTrace:      trpcTraceStr,
			Timestamp:       time.Time{},
			Payload:         nil,
			Environment:     "production",
			Service: &publicModel.ServiceInput{
				Name:    "my-app",
				Version: "abc123",
			},
		}})

		var result *model.ErrorObject
		err := resolver.DB.Model(&model.ErrorObject{
			ProjectID: project.ID,
		}).Where(&model.ErrorObject{Event: "dummy event"}).Take(&result).Error
		assert.NoError(t, err)

		if *result.StackTrace != trpcTraceStr {
			t.Fatal("stacktrace changed after processing")
		}

		assert.Equal(t, "my-app", result.ServiceName)
		assert.Equal(t, "abc123", result.ServiceVersion)
		assert.Equal(t, "production", result.Environment)
	})
}

func TestHandleErrorAndGroup(t *testing.T) {
	workspaceID := 1
	projectID := 1

	// construct table of sub-tests to run
	longTraceStr := `[{"functionName":"is","args":null,"fileName":null,"lineNumber":null,"columnNumber":null,"isEval":null,"isNative":null,"source":null},{"functionName":"longer","args":null,"fileName":null,"lineNumber":null,"columnNumber":null,"isEval":null,"isNative":null,"source":null},{"functionName":"trace","args":null,"fileName":null,"lineNumber":null,"columnNumber":null,"isEval":null,"isNative":null,"source":null}]`
	shortTraceStr := `[{"functionName":"a","args":null,"fileName":null,"lineNumber":null,"columnNumber":null,"isEval":null,"isNative":null,"source":null},{"functionName":"short","args":null,"fileName":null,"lineNumber":null,"columnNumber":null,"isEval":null,"isNative":null,"source":null}]`
	tests := map[string]struct {
		errorsToInsert      []model.ErrorObject
		expectedErrorGroups []model.ErrorGroup
		embeddingsToInsert  []model.ErrorObjectEmbeddings
		withEmbeddings      bool
	}{
		"test two errors with everything different but similar embeddings": {
			errorsToInsert: []model.ErrorObject{
				{
					Event:       "error: 1234",
					ProjectID:   projectID,
					Environment: "dev",
					Model:       model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC)},
					StackTrace:  &shortTraceStr,
					Payload:     pointy.String(`{"service": "bar"}`),
				},
				{
					Event:       "error: 4321",
					ProjectID:   projectID,
					Environment: "dEv",
					Model:       model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC)},
					StackTrace:  &shortTraceStr,
					Payload:     pointy.String(`{"service": "foo"}`),
				},
			},
			expectedErrorGroups: []model.ErrorGroup{},
			embeddingsToInsert: []model.ErrorObjectEmbeddings{
				{
					GteLargeEmbedding: vector,
				},
				{
					GteLargeEmbedding: vector,
				},
			},
			withEmbeddings: true,
		},
		"test two errors with same environment but different case": {
			errorsToInsert: []model.ErrorObject{
				{
					Event:       "error",
					ProjectID:   projectID,
					Environment: "dev",
					Model:       model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC)},
					StackTrace:  &shortTraceStr,
				},
				{
					Event:       "error",
					ProjectID:   projectID,
					Environment: "dEv",
					Model:       model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC)},
					StackTrace:  &shortTraceStr,
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					Event:        "error",
					ProjectID:    projectID,
					State:        privateModel.ErrorStateOpen,
					Environments: `{"dev":2}`,
				},
			},
			withEmbeddings: false,
		},
		"test two errors with different environment": {
			errorsToInsert: []model.ErrorObject{
				{
					Event:       "error",
					ProjectID:   projectID,
					Environment: "dev",
					Model:       model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC)},
					StackTrace:  &shortTraceStr,
				},
				{
					Event:       "error",
					ProjectID:   projectID,
					Environment: "prod",
					Model:       model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC)},
					StackTrace:  &shortTraceStr,
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					Event:        "error",
					ProjectID:    projectID,
					State:        privateModel.ErrorStateOpen,
					Environments: `{"dev":1,"prod":1}`,
				},
			},
		},
		"two errors, one with empty environment": {
			errorsToInsert: []model.ErrorObject{
				{
					ProjectID:   projectID,
					Environment: "dev",
					Model:       model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC)},
					Event:       "error",
					StackTrace:  &shortTraceStr,
				},
				{
					Event:      "error",
					ProjectID:  projectID,
					Model:      model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC)},
					StackTrace: &shortTraceStr,
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					Event:        "error",
					ProjectID:    projectID,
					State:        privateModel.ErrorStateOpen,
					Environments: `{"dev":1}`,
				},
			},
		},
		"test longer error stack first": {
			errorsToInsert: []model.ErrorObject{
				{
					Event:      "error",
					ProjectID:  projectID,
					Model:      model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC)},
					StackTrace: &longTraceStr,
				},
				{
					Event:      "error",
					ProjectID:  projectID,
					Model:      model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC)},
					StackTrace: &shortTraceStr,
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					Event:        "error",
					ProjectID:    projectID,
					StackTrace:   shortTraceStr,
					State:        privateModel.ErrorStateOpen,
					Environments: `{}`,
				},
			},
		},
		"test shorter error stack first": {
			errorsToInsert: []model.ErrorObject{
				{
					Event:      "error",
					ProjectID:  projectID,
					Model:      model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC)},
					StackTrace: &shortTraceStr,
				},
				{
					Event:      "error",
					ProjectID:  projectID,
					Model:      model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC)},
					StackTrace: &longTraceStr,
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					Event:        "error",
					ProjectID:    projectID,
					StackTrace:   longTraceStr,
					Environments: `{}`,
					State:        privateModel.ErrorStateOpen,
				},
			},
		},
	}
	//run tests
	for name, tc := range tests {
		util.RunTestWithDBWipeWithName(t, resolver.DB, name, func(t *testing.T) {
			workspace := model.Workspace{Model: model.Model{ID: workspaceID}}
			resolver.DB.Create(&workspace)

			project := model.Project{Model: model.Model{ID: projectID}, WorkspaceID: workspaceID}
			resolver.DB.Create(&project)

			settings := model.AllWorkspaceSettings{WorkspaceID: workspaceID, ErrorEmbeddingsGroup: tc.withEmbeddings}
			resolver.DB.Create(&settings)
			resolver.DB.Where(&model.AllWorkspaceSettings{WorkspaceID: workspaceID}).Select("error_embeddings_group").Updates(&model.AllWorkspaceSettings{ErrorEmbeddingsGroup: tc.withEmbeddings})

			_ = resolver.Redis.FlushDB(context.Background())

			// create the error group to match against
			var createdErrorGroup model.ErrorGroup
			if len(tc.expectedErrorGroups) == 0 {
				resolver.DB.Create(&createdErrorGroup)
			}

			var avgEmbedding model.Vector = make([]float32, 1024)
			for _, emb := range tc.embeddingsToInsert {
				eo := model.ErrorObject{ErrorGroupID: createdErrorGroup.ID, ProjectID: projectID}
				resolver.DB.Create(&eo)

				for i := range avgEmbedding {
					avgEmbedding[i] += (emb.GteLargeEmbedding[i] / float32(len(tc.embeddingsToInsert)))
				}
			}

			resolver.DB.Create(&model.ErrorGroupEmbeddings{
				ProjectID:         projectID,
				ErrorGroupID:      createdErrorGroup.ID,
				GteLargeEmbedding: avgEmbedding,
			})

			receivedErrorGroups := make(map[string]model.ErrorGroup)
			for _, errorObj := range tc.errorsToInsert {
				var frames []*publicModel.StackFrameInput
				if errorObj.StackTrace != nil && *errorObj.StackTrace != "" {
					if err := json.Unmarshal([]byte(*errorObj.StackTrace), &frames); err != nil {
						t.Fatal(e.Wrap(err, "error unmarshalling error stack trace frames"))
					}
				}

				_, structuredStackTrace, err := resolver.getMappedStackTraceString(context.Background(), frames, 1, &errorObj)
				if err != nil {
					t.Fatal(e.Wrap(err, "error making mapped stacktrace"))
				}

				errorGroup, err := resolver.HandleErrorAndGroup(context.TODO(), &errorObj, structuredStackTrace, nil, 1, &workspace)
				if err != nil {
					t.Fatal(e.Wrap(err, "error handling error and group"))
				}
				if errorGroup != nil {
					id := strconv.Itoa(errorGroup.ID)
					receivedErrorGroups[id] = *errorGroup
				}
			}

			// check that all error objects were matched to the one created error group
			if len(tc.expectedErrorGroups) == 0 {
				assert.Equal(t, []int{createdErrorGroup.ID}, lo.Union(lo.Map(lo.Values(receivedErrorGroups), func(item model.ErrorGroup, index int) int {
					return item.ID
				})))
				return
			}

			var i int
			for _, errorGroup := range receivedErrorGroups {
				isEqual, diff, err := areErrorGroupsEqual(&errorGroup, &tc.expectedErrorGroups[i])
				if err != nil {
					t.Fatal(e.Wrap(err, "error comparing two error groups"))
				}
				if !isEqual {
					t.Fatalf("received error group not equal to expected error group. diff: %+v", diff)
				}
				i++
			}
		})
	}
}

func TestMatchErrorsWithSameTracesDifferentBodies(t *testing.T) {
	stacktrace := `[{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/schema.resolvers.go","lineNumber":6517,"functionName":"Admin","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/resolver.go","lineNumber":216,"functionName":"getCurrentAdmin","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/schema.resolvers.go","lineNumber":6609,"functionName":"AdminRoleByProject","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/generated/generated.go","lineNumber":44838,"functionName":"func2","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":72,"functionName":"func4","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":110,"functionName":"1","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/sdk/highlight-go/tracer.go","lineNumber":59,"functionName":"InterceptField","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":109,"functionName":"func8","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":110,"functionName":"1","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/util/tracer.go","lineNumber":45,"functionName":"InterceptField","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":109,"functionName":"func8","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/generated/generated.go","lineNumber":44836,"functionName":"_Query_admin_role_by_project","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/generated/generated.go","lineNumber":66748,"functionName":"func316","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":69,"functionName":"func3","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/generated/generated.go","lineNumber":66753,"functionName":"func317","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null}]`

	var structuredStackTrace []*privateModel.ErrorTrace
	err := json.Unmarshal([]byte(stacktrace), &structuredStackTrace)
	if err != nil {
		t.Fatal("failed to generate structured stacktrace")
	}

	util.RunTestWithDBWipe(t, resolver.DB, func(t *testing.T) {
		project := model.Project{}
		resolver.DB.Create(&project)

		errorObject := model.ErrorObject{
			Event:      "error 1",
			ProjectID:  project.ID,
			StackTrace: &stacktrace,
		}

		errorGroup1, err := resolver.HandleErrorAndGroup(context.TODO(), &errorObject, structuredStackTrace, nil, project.ID, nil)
		assert.NoError(t, err)

		errorObject = model.ErrorObject{
			Event:      "error 2",
			ProjectID:  project.ID,
			StackTrace: &stacktrace,
		}

		errorGroup2, err := resolver.HandleErrorAndGroup(context.TODO(), &errorObject, structuredStackTrace, nil, project.ID, nil)
		assert.NoError(t, err)

		assert.Equal(t, errorGroup1.ID, errorGroup2.ID, "should return the same error group id")
	})
}

func TestUpdatingErrorState(t *testing.T) {
	ctx := context.TODO()

	stacktrace := `[{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/schema.resolvers.go","lineNumber":6517,"functionName":"Admin","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/resolver.go","lineNumber":216,"functionName":"getCurrentAdmin","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/schema.resolvers.go","lineNumber":6609,"functionName":"AdminRoleByProject","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/generated/generated.go","lineNumber":44838,"functionName":"func2","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":72,"functionName":"func4","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":110,"functionName":"1","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/sdk/highlight-go/tracer.go","lineNumber":59,"functionName":"InterceptField","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":109,"functionName":"func8","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":110,"functionName":"1","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/util/tracer.go","lineNumber":45,"functionName":"InterceptField","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":109,"functionName":"func8","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/generated/generated.go","lineNumber":44836,"functionName":"_Query_admin_role_by_project","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/generated/generated.go","lineNumber":66748,"functionName":"func316","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":69,"functionName":"func3","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/generated/generated.go","lineNumber":66753,"functionName":"func317","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null}]`

	var structuredStackTrace []*privateModel.ErrorTrace
	err := json.Unmarshal([]byte(stacktrace), &structuredStackTrace)
	if err != nil {
		t.Fatal("failed to generate structured stacktrace")
	}

	util.RunTestWithDBWipe(t, resolver.DB, func(t *testing.T) {
		project := model.Project{}
		resolver.DB.Create(&project)

		errorObject1 := model.ErrorObject{
			Event:      "error",
			ProjectID:  project.ID,
			StackTrace: &stacktrace,
		}

		errorGroup, err := resolver.HandleErrorAndGroup(ctx, &errorObject1, structuredStackTrace, nil, project.ID, nil)
		assert.NoError(t, err)
		assert.Equal(t, errorGroup.State, privateModel.ErrorStateOpen)

		err = resolver.Store.UpdateErrorGroupStateBySystem(ctx, store.UpdateErrorGroupParams{
			ID:    errorGroup.ID,
			State: privateModel.ErrorStateResolved,
		})
		assert.NoError(t, err)

		errorObject2 := model.ErrorObject{
			Event:      "error",
			ProjectID:  project.ID,
			StackTrace: &stacktrace,
		}

		errorGroup, err = resolver.HandleErrorAndGroup(ctx, &errorObject2, structuredStackTrace, nil, project.ID, nil)
		assert.NoError(t, err)
		assert.Equal(t, errorGroup.State, privateModel.ErrorStateOpen)

		err = resolver.Store.UpdateErrorGroupStateBySystem(ctx, store.UpdateErrorGroupParams{
			ID:    errorGroup.ID,
			State: privateModel.ErrorStateIgnored,
		})
		assert.NoError(t, err)

		errorObject3 := model.ErrorObject{
			Event:      "error",
			ProjectID:  project.ID,
			StackTrace: &stacktrace,
		}

		errorGroup, err = resolver.HandleErrorAndGroup(ctx, &errorObject3, structuredStackTrace, nil, project.ID, nil)
		assert.NoError(t, err)
		assert.Equal(t, privateModel.ErrorStateIgnored, errorGroup.State) // Should stay ignored

	})
}

func TestResolver_isExcludedError(t *testing.T) {
	assert.False(t, resolver.isExcludedError(context.Background(), 1, []string{}, ""))
	assert.True(t, resolver.isExcludedError(context.Background(), 2, []string{}, "[{}]"))
	assert.True(t, resolver.isExcludedError(context.Background(), 3, []string{".*a+.*"}, "foo bar baz"))
	assert.False(t, resolver.isExcludedError(context.Background(), 4, []string{"("}, "foo bar baz"))
}

// areErrorGroupsEqual compares two error objects while ignoring the Model and SecureID field
// a and b MUST be pointers, otherwise this won't work
func areErrorGroupsEqual(a *model.ErrorGroup, b *model.ErrorGroup) (bool, []string, error) {
	if reflect.TypeOf(a) != reflect.TypeOf(b) {
		return false, nil, e.New("interfaces to compare aren't the same time")
	}

	aReflection := reflect.ValueOf(a)
	// Check if the passed interface is a pointer
	if aReflection.Type().Kind() != reflect.Ptr {
		return false, nil, e.New("`a` is not a pointer")
	}
	// 'dereference' with Elem() and get the field by name
	aModelField := aReflection.Elem().FieldByName("Model")
	aSecureIDField := aReflection.Elem().FieldByName("SecureID")
	aStackTraceField := aReflection.Elem().FieldByName("StackTrace")

	bReflection := reflect.ValueOf(b)
	// Check if the passed interface is a pointer
	if bReflection.Type().Kind() != reflect.Ptr {
		return false, nil, e.New("`b` is not a pointer")
	}
	// 'dereference' with Elem() and get the field by name
	bModelField := bReflection.Elem().FieldByName("Model")
	bSecureIDField := bReflection.Elem().FieldByName("SecureID")
	bStackTraceField := bReflection.Elem().FieldByName("StackTrace")

	if aModelField.IsValid() && bModelField.IsValid() {
		// override Model on b with a's model
		bModelField.Set(aModelField)
	} else if aModelField.IsValid() || bModelField.IsValid() {
		// return error if one has a model and the other doesn't
		return false, nil, e.New("one interface has a model and the other doesn't")
	}

	if aSecureIDField.IsValid() && bSecureIDField.IsValid() {
		// override SecureID on b with a's SecureID
		bSecureIDField.Set(aSecureIDField)
	} else if aSecureIDField.IsValid() || bSecureIDField.IsValid() {
		// return error if one has a SecureID and the other doesn't
		return false, nil, e.New("one interface has a SecureID and the other doesn't")
	}

	if aStackTraceField.IsValid() && bStackTraceField.IsValid() {
		// override StackTrace on b with a's StackTrace
		bStackTraceField.Set(aStackTraceField)
	} else if aStackTraceField.IsValid() || bStackTraceField.IsValid() {
		// return error if one has a StackTrace and the other doesn't
		return false, nil, e.New("one interface has a StackTrace and the other doesn't")
	}

	// get diff
	diff := deep.Equal(aReflection.Interface(), bReflection.Interface())
	isEqual := len(diff) == 0

	return isEqual, diff, nil
}

func Test_WithinQuota_CommittedPricing(t *testing.T) {
	ctx := context.TODO()

	for _, limitsEnabled := range []bool{false, true} {
		util.RunTestWithDBWipeWithName(t, resolver.DB, fmt.Sprintf(`limits-%t`, limitsEnabled), func(t *testing.T) {
			// clear workspace settings cache
			_ = resolver.Redis.FlushDB(ctx)

			resolver.DB.Create(&model.Project{
				Model: model.Model{
					ID: 1,
				},
				WorkspaceID: 1,
			})
			resolver.DB.Create(&model.Project{
				Model: model.Model{
					ID: 2,
				},
				WorkspaceID: 2,
			})

			jan1 := time.Date(2023, time.January, 1, 0, 0, 0, 0, time.UTC)
			feb1 := jan1.AddDate(0, 1, 0)
			workspaceBasic := model.Workspace{
				Model: model.Model{
					ID: 1,
				},
				PlanTier:           privateModel.PlanTypeBasic.String(),
				SessionsMaxCents:   pointy.Int(500),
				BillingPeriodStart: &jan1,
				BillingPeriodEnd:   &feb1,
			}
			resolver.DB.Create(&workspaceBasic)

			workspaceUsageBased := model.Workspace{
				Model: model.Model{
					ID: 2,
				},
				PlanTier:           privateModel.PlanTypeUsageBased.String(),
				SessionsMaxCents:   pointy.Int(500),
				BillingPeriodStart: &jan1,
				BillingPeriodEnd:   &feb1,
			}
			resolver.DB.Create(&workspaceUsageBased)

			resolver.DB.Create(&model.AllWorkspaceSettings{
				WorkspaceID:         workspaceBasic.ID,
				EnableBillingLimits: limitsEnabled,
			})
			resolver.DB.Create(&model.AllWorkspaceSettings{
				WorkspaceID:         workspaceUsageBased.ID,
				EnableBillingLimits: limitsEnabled,
			})

			// workspace 1: basic (10k included), 1k overage, $5 = 1k sessions until limit. within limit.
			// workspace 2: usage based (500 included), 500 overage, $5 = 250 sessions until limit. not within limit.
			resolver.DB.Exec(`drop materialized view daily_session_counts_view`)
			resolver.DB.Exec(`
				select * into daily_session_counts_view 
				from (
					select 1 as project_id, '2023-01-01'::date as date, 11000 as count
					union all select 1, '2023-01-02'::date, 0
					union all select 2, '2023-01-01'::date, 1000
					union all select 2, '2023-01-02'::date, 0) a
			`)

			basicWithinBillingQuota, _ := resolver.IsWithinQuota(ctx, model.PricingProductTypeSessions, &workspaceBasic, time.Now())
			assert.True(t, basicWithinBillingQuota)

			usageBasedWithinBillingQuota, _ := resolver.IsWithinQuota(ctx, model.PricingProductTypeSessions, &workspaceUsageBased, time.Now())
			if limitsEnabled {
				assert.False(t, usageBasedWithinBillingQuota)
			} else {
				assert.True(t, usageBasedWithinBillingQuota)
			}
		})
	}
}

func TestInitializeSessionImpl(t *testing.T) {
	ctx := context.TODO()

	util.RunTestWithDBWipe(t, resolver.DB, func(t *testing.T) {
		workspace := model.Workspace{}
		resolver.DB.Create(&workspace)

		project := model.Project{
			WorkspaceID: workspace.ID,
		}

		resolver.DB.Create(&project)

		session, err := resolver.InitializeSessionImpl(ctx, &kafka_queue.InitializeSessionArgs{
			ProjectVerboseID: project.VerboseID(),
			ServiceName:      "my-frontend-app",
			ClientConfig:     "{}",
		})
		assert.NoError(t, err)
		assert.NotNil(t, session.ID)

		service, err := resolver.Store.FindService(ctx, project.ID, "my-frontend-app")

		assert.NoError(t, err)
		assert.NotNil(t, service.ID)
	})
}

func TestErrorIngestFilters(t *testing.T) {
	ctx := context.TODO()

	util.RunTestWithDBWipe(t, resolver.DB, func(t *testing.T) {
		err := resolver.Redis.FlushDB(ctx)
		if err != nil {
			t.Fatal(e.Wrap(err, "error clearing database"))
		}

		project := model.Project{Name: pointy.String("test")}
		if err := resolver.DB.Create(&project).Error; err != nil {
			t.Fatal(err)
		}

		filterSettings := model.ProjectFilterSettings{ProjectID: project.ID, ErrorExclusionQuery: pointy.String(`service_name=whop-api-v2 OR service_name=data-whop-com OR (service_name=core-marketplace-v2 AND event="*Minified*")`)}
		if err := resolver.DB.Create(&filterSettings).Error; err != nil {
			t.Fatal(err)
		}

		errorObject := publicModel.BackendErrorObjectInput{
			Event: "Dang a React Minified error has occurred.",
			Service: &publicModel.ServiceInput{
				Name: "core-marketplace-v2",
			},
		}
		filters := parser.Parse(*filterSettings.ErrorExclusionQuery, clickhouse.BackendErrorObjectInputConfig)
		matches := clickhouse.ErrorMatchesQuery(&errorObject, filters)
		assert.True(t, matches)
		assert.False(t, resolver.IsErrorIngested(ctx, project.ID, &errorObject))

		errorObject.Service.Name = "bean"
		matches = clickhouse.ErrorMatchesQuery(&errorObject, filters)
		assert.False(t, matches)
		assert.True(t, resolver.IsErrorIngested(ctx, project.ID, &errorObject))

		errorObject.Service.Name = "whop-api-v2"
		errorObject.Event = "another error tho"
		matches = clickhouse.ErrorMatchesQuery(&errorObject, filters)
		assert.True(t, matches)
		assert.False(t, resolver.IsErrorIngested(ctx, project.ID, &errorObject))
	})
}

func TestGetErrorAppVersion(t *testing.T) {
	ctx := context.TODO()

	util.RunTestWithDBWipe(t, resolver.DB, func(t *testing.T) {
		session := &model.Session{
			ServiceName: "foo",
			AppVersion:  pointy.String("bar"),
			Environment: "production",
		}
		assert.NoError(t, resolver.DB.Create(session).Error)

		errorObject := model.ErrorObject{
			Event: "Dang a React Minified error has occurred.",
		}
		version := resolver.GetErrorAppVersion(ctx, &errorObject)
		assert.Nil(t, version)

		errorObject.ServiceName = "yo"
		errorObject.ServiceVersion = "dawg"
		version = resolver.GetErrorAppVersion(ctx, &errorObject)
		assert.NotNil(t, version)
		assert.Equal(t, *version, "dawg")

		errorObject.SessionID = pointy.Int(session.ID)
		version = resolver.GetErrorAppVersion(ctx, &errorObject)
		assert.NotNil(t, version)
		assert.Equal(t, *version, "bar")
	})
}
