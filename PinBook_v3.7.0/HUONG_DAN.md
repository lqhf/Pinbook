# PinBook – Bookmark theo cây thư mục, kèm ảnh preview riêng

## Cài đặt (chế độ Developer)

1. Giải nén file `pinbook.zip` ra một thư mục bất kỳ.
2. Mở Chrome, vào địa chỉ: `chrome://extensions`
3. Bật **Developer mode** (góc trên bên phải).
4. Bấm **Load unpacked**, chọn thư mục `pinbook` vừa giải nén.
5. Ghim icon 📌 PinBook lên thanh công cụ cho tiện dùng.

Nếu bạn đang nâng cấp từ bản cũ: giải nén đè lên thư mục cũ rồi vào `chrome://extensions` bấm **reload (⟳)** trên PinBook — dữ liệu bookmark/thư mục cũ vẫn giữ nguyên.

## Giao diện 2 khung (giống Explorer / Bookmark Manager)

- **Khung trái (Sidebar)**: cây thư mục đầy đủ — **Tất cả**, **Chưa phân loại**, rồi đến toàn bộ thư mục của bạn theo dạng phân cấp, thụt lề, có mũi tên **▾/▸** để thu/mở. Thư mục có thể lồng trong thư mục khác, không giới hạn số cấp.
- **Khung phải (List View)**: hiển thị nội dung của thư mục đang chọn ở sidebar — gồm các **thư mục con nằm trực tiếp bên trong** (nếu có) rồi đến các **bookmark nằm trực tiếp bên trong**. Có breadcrumb (đường dẫn) ở đầu khung để biết đang ở đâu và bấm để quay lại cấp cha, cùng nút chuyển đổi **☰ Danh sách / ▦ Lưới** ở góc phải để đổi cách hiển thị (lựa chọn được ghi nhớ cho lần mở sau). Đang chọn sẵn 1 hay nhiều mục thì chuyển đổi Danh sách ⇄ Lưới, hoặc bật/tắt "Ảnh Preview"/"Không Preview" (miễn các mục đó vẫn còn hiển thị sau khi lọc), **vẫn giữ nguyên trạng thái đang chọn đó**, đồng thời tự cuộn để mục **trên cùng trong nhóm đang chọn** hiện ra chính giữa màn hình (chọn 1 mục thì chính mục đó luôn nằm giữa màn hình).
- Bấm vào một thư mục con trong danh sách bên phải sẽ **đi vào trong** thư mục đó (giống double-click mở thư mục), danh sách bên phải cập nhật theo.

## Cách dùng

- **+ Tab này**: lưu nhanh tab đang mở, tự động chụp ảnh màn hình của tab đó làm ảnh preview mặc định (bạn có thể đổi sau).
- **+ Thêm**: thêm bookmark bất kỳ, chọn thư mục (dropdown hiển thị đúng cây, có thể tạo thư mục con ngay tại đó) và nguồn ảnh:
  - **Tải ảnh lên**: chọn file ảnh từ máy.
  - **Chụp tab hiện tại**: chụp lại đúng những gì đang hiển thị trên tab đang mở.
  - **Dán link ảnh**: dán URL ảnh rồi bấm "Lấy ảnh".
  - Nếu đã chọn ảnh (kể cả ảnh có sẵn khi sửa bookmark cũ), góc dưới-phải khung xem trước có nút **🗑 Xóa ảnh** để bỏ hẳn ảnh preview, đưa bookmark về trạng thái không có ảnh.
- Dưới tên mỗi bookmark là **URL đầy đủ** (chỉ bỏ tiền tố `https://`/`http://`), không rút gọn về domain nữa — nếu link dài quá khung hiển thị sẽ bị cắt bớt bằng dấu "…".
- Rà chuột vào một dòng để hiện nút **⋮**, bấm vào để mở menu **Chỉnh sửa / Xóa / Cắt / Sao chép / Dán** (chi tiết ở phần "Chỉnh sửa/xóa/cắt/sao chép/dán" bên dưới). Với bookmark có ảnh, **rà chuột vào ảnh thumbnail** sẽ bật ra một khung ảnh nổi lớn hơn, đúng tỉ lệ gốc, đè lên các phần tử khác.
- **Bấm 1 lần vào một bookmark hoặc thư mục** sẽ **chọn/in đậm** nó, chưa làm gì thêm — bấm thêm lần nữa vào đúng mục đang chọn thì: bookmark sẽ **mở link ở tab mới**, còn thư mục sẽ **đi vào trong**. Có thể **double-click thẳng vào thư mục** để vào ngay khỏi cần chọn 2 lần. Bấm sang mục khác hoặc chỗ trống sẽ bỏ chọn.
- **Chọn nhiều mục cùng lúc (liền nhau)**: bấm 1 mục đầu tiên, giữ **Shift** rồi bấm mục cuối cùng — toàn bộ các mục nằm giữa (kể cả bookmark lẫn thư mục xen kẽ nhau) sẽ được chọn hết. Bấm tiếp Shift+Click mục khác sẽ nới rộng/thu hẹp lại từ đúng mục đầu tiên đó.
- **Chọn nhiều mục rời rạc**: bấm 1 mục đầu tiên, giữ **Ctrl** rồi bấm lần lượt từng mục rời khác (không liền kề) — mỗi lần Ctrl+Click sẽ thêm/bớt đúng mục đó khỏi danh sách đang chọn, các mục còn lại giữ nguyên. Khi Kéo-thả, Cắt, Sao chép rồi Dán một nhóm chọn rời rạc như vậy, các mục đó sẽ được xếp **liền sát nhau** tại vị trí mới, theo đúng **thứ tự ban đầu** của chúng (mục nào đứng trước lúc chọn thì vẫn đứng trước sau khi di chuyển/dán), bất kể bạn Ctrl+Click theo thứ tự nào.
- Bấm thường (không giữ Shift/Ctrl) vào một mục sẽ hủy chọn nhiều, quay về chọn 1 mục. Khi chọn từ 2 mục trở lên, một dòng thông báo **"Đã chọn N mục"** hiện ở giữa, trên cùng màn hình — tự biến mất khi chỉ còn chọn 1 mục hoặc bỏ chọn hết.
- Mở bookmark ở tab mới (bấm lần 2 vào bookmark đang chọn) sẽ **không làm mất trạng thái đang chọn** — mục đó (hoặc cả nhóm đang chọn) vẫn giữ nguyên in đậm sau khi mở, tiện để mở lần lượt nhiều link mà không phải chọn lại từ đầu.
- **Điều hướng bằng bàn phím** khi đã chọn 1 mục:
  - `↑` / `↓`: chuyển sang chọn mục liền trước / liền sau trong danh sách đang xem.
  - `Enter`: thư mục thì đi vào trong (giống bấm lần 2), bookmark thì mở tab mới. Nếu đang chọn **nhiều mục**, `Enter` sẽ mở tất cả bookmark trong đó ra tab mới (mỗi cái 1 tab, thư mục trong nhóm chọn bị bỏ qua vì không có hành động "mở" phù hợp cho nhiều thư mục cùng lúc).
  - `Ctrl+A` (chỉ ở chế độ Toàn màn hình): chọn tất cả mục (cả bookmark lẫn thư mục) đang hiển thị trong thư mục mở ở khung bên phải.
- **Chuột phải vào một bookmark hoặc thư mục bất kỳ** sẽ mở menu y hệt như bấm nút **⋮** của chính mục đó. Nếu mục đó đang nằm trong một lượt chọn nhiều, menu sẽ chỉ còn 4 lựa chọn **Xóa / Cắt / Sao chép / Dán** (không có "Chỉnh sửa", vì không thể sửa nhiều mục cùng lúc) và áp dụng cho toàn bộ các mục đang chọn.
- **Chuột phải ở khu vực ngoài 2 khung** (thanh trên cùng, ô tìm kiếm, hoặc lề trống quanh 2 khung khi cửa sổ Toàn màn hình đủ rộng) mới hiện menu nhanh **+ Thêm bookmark mới** / **+ Thêm thư mục mới** — thư mục mới sẽ được tạo ngay trong thư mục đang mở (nếu đang xem "Tất cả"/"Chưa phân loại"/kết quả tìm kiếm thì tạo ở cấp gốc). Chuột phải ngay trên một bookmark/thư mục thì theo quy tắc ở trên (mở menu của chính mục đó), không còn hiện menu "Thêm mới" nữa.
- Ô tìm kiếm lọc theo tên/URL bookmark **và tên thư mục**, theo kiểu **giống thanh tìm kiếm Bookmark của Chrome**: gõ nhiều từ cách nhau bằng dấu cách, PinBook sẽ tìm những mục chứa **đủ tất cả các từ đó**, **không cần đúng thứ tự** (ví dụ gõ "chrome bookmark" vẫn ra kết quả tên "Bookmark manager for Chrome"). Chỉ những mục có **tên tự nó khớp** mới hiện ra (thư mục cha không khớp tên sẽ không hiện ra chỉ vì có bookmark khớp bên trong) — kết quả xếp theo đúng thứ tự cây thư mục (giống sidebar): đi lần lượt từng thư mục từ trên xuống, thư mục con khớp tên hiện trước, bookmark khớp tên của thư mục đó hiện ngay sau, rồi mới sang thư mục tiếp theo. Bấm vào một thư mục trong kết quả sẽ đi thẳng vào trong đó.
- **5 chế độ tìm kiếm** (viên thuốc dưới ô tìm kiếm, bấm icon **i** để xem giải thích):
  1. **Bình thường**: chứa đủ các từ, không cần đúng thứ tự, không cần liền nhau.
  2. **Đúng thứ tự**: chứa đủ các từ, đúng thứ tự trái sang phải, nhưng **không cần liền nhau** (có thể xen nội dung khác ở giữa các từ).
  3. **Bất kỳ từ nào**: chỉ cần khớp 1 trong các từ.
  4. **Liền nhau**: khớp đúng cụm từ, đúng thứ tự và **liền nhau** — không tách rời từng từ (chặt chẽ nhất).
  5. **Chỉ tên**: chỉ so khớp trên tên, bỏ qua URL.
- **Phạm vi tìm kiếm đi theo đúng nơi bạn đang mở**: nếu đang mở sẵn một thư mục cụ thể rồi mới gõ tìm kiếm, PinBook chỉ tìm **bên trong thư mục đó** (kể cả thư mục con lồng bên trong), không lục sang thư mục khác hay "Chưa phân loại". Đang mở "Chưa phân loại" thì tìm kiếm cũng chỉ trong "Chưa phân loại". Muốn tìm trên **toàn bộ** PinBook như trước đây thì chọn thư mục **"Tất cả"** trước rồi mới gõ tìm kiếm. Dòng chữ "Kết quả tìm kiếm cho…" phía trên danh sách sẽ luôn ghi kèm tên phạm vi đang tìm (ví dụ: `Kết quả tìm kiếm cho "chrome" trong Work`) để biết chắc mình đang tìm ở đâu.
- **Đang tìm kiếm thì không kéo-thả sắp xếp được** — vì kết quả tìm kiếm không phản ánh đúng thứ tự thật của các mục trong thư mục của chúng, kéo-thả lúc này dễ gây hiểu nhầm/sai vị trí. Xóa nội dung ô tìm kiếm để kéo-thả lại bình thường. (Kể cả lúc bị chặn, thử kéo cũng sẽ không làm bôi đen văn bản các mục khác.)
- **Ô tick "Ảnh Preview" / "Không Preview"** cạnh thanh tìm kiếm: bật **"Ảnh Preview"** để chỉ hiện bookmark **có** ảnh preview; bật **"Không Preview"** để chỉ hiện bookmark **chưa có** ảnh preview — 2 ô này loại trừ nhau (bật ô này sẽ tự tắt ô kia). Áp dụng cả khi đang tìm kiếm lẫn khi xem bình thường. **Thư mục không bị lọc**, luôn hiện đầy đủ dù có bật ô nào hay không. Lựa chọn được ghi nhớ cho lần mở sau.
- Nếu đang có từ khóa tìm kiếm mà bấm vào một thư mục ở **sidebar bên trái** (chế độ Toàn màn hình), PinBook sẽ **xóa luôn nội dung ô tìm kiếm** và chuyển thẳng đến thư mục đó ngay lập tức.
- Khi đang xem **kết quả tìm kiếm**, menu **⋮** (hoặc chuột phải) trên từng mục có thêm lựa chọn **📂 Hiển thị trong thư mục** — đưa bạn đến đúng thư mục cha (cao hơn 1 cấp) chứa mục đó và **in đậm/chọn sẵn** mục đó trong danh sách, để biết chính xác nó đang nằm ở đâu.

### Chỉnh sửa / Xóa / Cắt / Sao chép / Dán

Bấm nút **⋮** trên một bookmark hoặc thư mục (hoặc chọn nó rồi dùng phím tắt) để:
- **Chỉnh sửa** (`Ctrl+Q`): bookmark mở form sửa (bấm **Enter** để lưu nhanh, khỏi cần bấm nút "Lưu" — riêng ô "Dán link ảnh" thì Enter sẽ bấm hộ nút "Lấy ảnh"), thư mục thì mở hộp thoại đổi tên (cũng bấm **Enter** để lưu nhanh).
- **Xóa** (`Delete`): xóa ngay lập tức, **không hỏi xác nhận nữa** — xóa bookmark, hoặc xóa thư mục thì **xóa luôn toàn bộ thư mục con và bookmark bên trong** (không còn chuyển về "Chưa phân loại"/đưa lên 1 cấp như trước). Thay cho hộp thoại xác nhận, một bảng thông báo nhỏ hiện ở **góc dưới bên trái** kiểu `"[Tên mục]" đã bị xóa`, kèm nút **Hoàn tác** — bấm vào (hoặc nhấn `Ctrl+Z`) trong vòng vài giây để khôi phục lại nguyên trạng (đúng cả cấu trúc thư mục con bên trong nếu đó là 1 thư mục).
- **Hoàn tác (`Ctrl+Z`) không chỉ áp dụng cho Xóa** — Kéo-thả sắp xếp lại, Cắt→Dán (di chuyển), và Sao chép→Dán cũng đều hoàn tác được: bấm nút **Hoàn tác** ở bảng thông báo góc dưới trái, hoặc nhấn `Ctrl+Z`, sẽ hủy đúng **hành động gần nhất** vừa làm (bất kể là loại nào trong số này). Chỉ hoàn tác được **1 hành động gần nhất** — hoàn tác xong, hoặc làm thêm 1 hành động (xóa/kéo-thả/cắt-dán/sao chép-dán) khác, thì hành động cũ không hoàn tác lại được nữa.
- **Cắt** (`Ctrl+X`) / **Sao chép** (`Ctrl+C`): đưa mục đó vào "khay nhớ tạm" của PinBook. Riêng **Sao chép** còn ghi thêm vào khay nhớ tạm **của hệ thống** — nếu sau đó bạn bấm Ctrl+V ở **ngoài** PinBook (thanh địa chỉ, ứng dụng khác...), sẽ dán ra **tên thư mục** (nếu sao chép thư mục) hoặc **URL** (nếu sao chép bookmark). Sao chép nhiều mục cùng lúc thì mỗi mục một dòng.
- **Dán** (`Ctrl+V`): dán mục đã Cắt/Sao chép vào **thư mục đang xem**. Nếu lúc Dán bạn đang **chọn sẵn 1 mục khác** (bookmark hoặc thư mục), mục được dán sẽ chèn vào **ngay sau mục đang chọn đó** (cùng thư mục cha với nó) thay vì luôn thêm vào cuối danh sách. Cắt rồi Dán sẽ **di chuyển** mục đó sang thư mục khác (kể cả xuyên nhiều cấp), Sao chép rồi Dán sẽ **tạo bản sao** (thư mục sao chép nhân bản đầy đủ cả tên lẫn nội dung bên trong — thư mục con và bookmark). Cắt/Sao chép ở tab này rồi Dán ở tab khác (popup hoặc một tab Toàn màn hình khác) vẫn hoạt động bình thường, đầy đủ tên/link — không chỉ dán được mỗi URL. Chọn **nhiều mục cùng lúc** rồi Cắt/Sao chép/Dán cũng hoạt động bình thường.

Các phím tắt trên áp dụng cho mục đang được **chọn** (bấm 1 lần để chọn) và chỉ hoạt động khi không gõ trong ô nhập liệu. Xem đầy đủ danh sách phím tắt ở **⋯ → ⌨ Phím tắt**.

### Sắp xếp lại bằng kéo-thả (chỉ ở chế độ Toàn màn hình, kiểu Danh sách)

Thư mục con và bookmark trong cùng 1 thư mục cha giờ **xen kẽ nhau theo đúng thứ tự bạn sắp xếp** (không còn tách "thư mục lên trước, bookmark xuống sau" nữa).

Nhấn giữ chuột vào một bookmark hoặc thư mục trong List View rồi kéo: một khung nhỏ hình viên thuốc hiện tên rút gọn (hoặc "N mục đã chọn" nếu đang kéo nhiều mục cùng lúc) sẽ bám theo con trỏ. Kéo qua **bất kỳ mục nào khác** (bookmark hoặc thư mục, không phân biệt loại) sẽ hiện một **đường kẻ ngang màu xanh** đúng vị trí sẽ chèn vào — thả chuột ra để xác nhận, **khung bên trái (sidebar) cũng cập nhật ngay lập tức** nếu thứ tự thư mục thay đổi, không cần tải lại trang. Trong lúc kéo, các mục khác không bị bôi đen/chọn văn bản khi con trỏ đi qua (chỉ có đường kẻ xanh làm chỉ báo). Nếu đang **chọn nhiều mục** (kể cả các mục rời rạc chọn bằng Ctrl+Click — xem phần "Chọn nhiều mục" bên dưới) và kéo 1 trong số đó, cả nhóm sẽ di chuyển cùng nhau, luôn xếp **liền sát nhau** tại vị trí mới theo đúng **thứ tự ban đầu** của chúng. Tính năng này chỉ đổi **vị trí trong cùng thư mục đang xem**; muốn chuyển sang thư mục khác thì dùng **Cắt → Dán**.

### Quản lý thư mục

- Rà chuột vào một thư mục ở sidebar (hoặc dòng thư mục con bên khung phải) để hiện nút thao tác:
  - Ở sidebar: **+** (thêm thư mục con), **✎** (đổi tên), **🗑** (xóa).
  - Ở khung phải: **⋮** (menu Chỉnh sửa/Xóa/Cắt/Sao chép/Dán — xem phần "Chỉnh sửa / Xóa / Cắt / Sao chép / Dán" ở trên).
- Xóa một thư mục sẽ chuyển bookmark trực tiếp trong đó về "Chưa phân loại", còn thư mục con bên trong được đưa lên 1 cấp (không bị xóa theo).
- Số trong ngoặc cạnh tên thư mục ở sidebar là tổng số bookmark trong thư mục đó **và toàn bộ thư mục con** của nó; số cạnh tên thư mục ở khung phải (List View) là số mục **trực tiếp** bên trong (giống Explorer).
- **Thu gọn/Mở rộng thư mục con ở sidebar được ghi nhớ**: bấm mũi tên ▾ cạnh 1 thư mục để **Thu gọn** (ẩn thư mục con bên trong) — lần sau mở lại PinBook, thư mục đó vẫn tự động ở trạng thái Thu gọn. Bấm lại để **Mở rộng** thì lần sau mở PinBook sẽ quay về chế độ **Tự động** (mặc định mở rộng, giống như trước khi bạn từng bấm Thu gọn). Xóa 1 thư mục cũng tự xóa luôn trạng thái đã lưu của nó.

### Mở rộng cửa sổ toàn tab

Bấm nút **⋯** → **⛶ Mở rộng cửa sổ**. PinBook sẽ mở trong một tab trình duyệt riêng với cùng bố cục 2 khung nhưng rộng rãi hơn. Dữ liệu dùng chung với popup, thêm/sửa/xóa ở bên nào cũng đồng bộ ngay.

**Lưu nhanh link bằng khay nhớ tạm:** copy một link rồi bấm **Ctrl+Shift+K** ở PinBook (không cần bấm vào ô nào cả, miễn con trỏ không đang ở trong một ô nhập liệu) — link sẽ tự động được lưu lại. Nếu đang **chọn sẵn 1 mục** (bookmark hoặc thư mục), link mới sẽ chèn vào **ngay sau mục đang chọn đó** (cùng thư mục cha với nó); nếu không chọn gì thì lưu vào cuối **thư mục đang mở** (xem "Tất cả" / "Chưa phân loại" / kết quả tìm kiếm thì lưu vào "Chưa phân loại"). Vì thao tác này không có ô nhập tên, bookmark sẽ tự lấy **chính đường link** làm tên — bạn có thể đổi tên sau bằng nút Sửa (✎). Tổ hợp này tách riêng khỏi **Ctrl+V** (Dán) nên không còn xung đột với Cắt/Sao chép/Dán nữa — dùng cái nào cũng luôn hoạt động đúng như mong đợi.

**URL tự thay đổi theo trạng thái đang xem:** ở chế độ Toàn màn hình, địa chỉ trên thanh URL của trình duyệt sẽ tự cập nhật theo những gì bạn đang làm — vào một thư mục, gõ từ khóa tìm kiếm, đổi chế độ tìm kiếm, bật/tắt "Ảnh Preview"/"Không Preview", và **chọn 1 hay nhiều mục** (mỗi mục/nhóm mục khác nhau ứng với 1 URL khác nhau). Nhờ vậy bạn có thể:
  - **Tải lại trang (F5)** mà không bị quay về "Tất cả" — đúng thư mục/từ khóa/chế độ/mục đang chọn đều được giữ nguyên.
  - **Copy URL để lưu/chia sẻ** một view cụ thể (ví dụ: đúng thư mục + đúng từ khóa đang lọc + đúng mục đang được chọn sẵn).
  - **Nút Back/Forward của trình duyệt**: mỗi lần vào một thư mục mới tính là 1 bước — bấm Back sẽ quay lại thư mục vừa xem trước đó, giống thao tác duyệt web bình thường. Riêng gõ tìm kiếm / đổi chế độ tìm kiếm / bật-tắt lọc ảnh / đổi mục đang chọn chỉ cập nhật URL hiện tại, không tạo thêm bước Back/Forward (tránh mỗi ký tự gõ hay mỗi lần bấm chọn lại thành 1 bước lùi).
  - Popup (bấm icon PinBook trên thanh công cụ) không có URL để chia sẻ nên không áp dụng tính năng này — chỉ chế độ Toàn màn hình mới có.

**Tiêu đề tab** (hiện trên thanh tab của trình duyệt, chế độ Toàn màn hình) đổi theo **thư mục đang xem hoặc từ khóa đang tìm kiếm** — không đổi theo mục đang chọn (chọn 1 hay nhiều mục không ảnh hưởng tiêu đề, để tránh rối mắt). Tiêu đề chỉ thật sự cập nhật sau khi bạn **dừng lại (ở yên 1 thư mục, hoặc ngừng gõ tìm kiếm) khoảng 2,5 giây** — chuyển nhanh qua nhiều thư mục hay gõ liên tục sẽ không làm tiêu đề nhấp nháy theo từng bước.

### Phím tắt toàn cục (dùng được ở bất kỳ tab nào, không cần mở PinBook trước)

Vào `chrome://extensions/shortcuts` để xem hoặc đổi lại phím tắt nếu bị trùng với extension khác:

- **Ctrl+Shift+Y** (Mac: **Cmd+Shift+Y**): lưu nhanh tab đang mở vào **"Chưa phân loại"**. Nếu trang không có tiêu đề, bookmark sẽ lấy chính đường link làm tên. Icon PinBook trên thanh công cụ sẽ nháy dấu ✓ xanh để xác nhận đã lưu (hoặc ✕ đỏ nếu tab hiện tại không phải trang web hợp lệ để lưu).
- **Ctrl+Shift+F** (Mac: **Cmd+Shift+F**): mở ngay PinBook ở chế độ Toàn màn hình, dù đang ở tab nào.

Nếu popup hoặc tab Toàn màn hình đang mở sẵn khi bạn dùng Ctrl+Shift+Y, danh sách sẽ tự cập nhật ngay mà không cần tải lại.

### Nhập bookmark từ file HTML (kèm thư mục, giữ cả link trùng)

Bấm nút **⋯** → **⬆ Nhập bookmark (.html)**, chọn file bookmark đã export.

Cách tạo file này từ Chrome: mở `chrome://bookmarks` → menu (⋮) → **Export bookmarks** → lưu file `.html`. Firefox/Edge cũng có tùy chọn tương tự.

Lưu ý:
- PinBook đọc đúng cấu trúc thư mục lồng nhau trong file — không giới hạn độ sâu — và dựng lại thành cây thư mục thật.
- Bookmark được nhập theo **đúng vị trí đã sắp xếp trong file gốc** (kể cả xen kẽ giữa thư mục và bookmark) — nhập lại vào PinBook trống sẽ cho đúng thứ tự y hệt lúc export.
- Riêng ở view **"Tất cả"** (sắp theo thời điểm tạo, mới nhất lên trên, gộp chung mọi thư mục): PinBook đọc `ADD_DATE` gốc trong file để giữ đúng thời điểm tạo — nếu file đến từ Chrome/Firefox/Edge thì dùng ngày họ ghi lại; nếu thẻ nào thiếu `ADD_DATE` mới dùng tạm thứ tự trong file thay thế.
- **Link trùng nhau (kể cả trùng nhiều lần) đều được giữ nguyên, không bị lọc bỏ** — mỗi thẻ `<A>` trong file sẽ tạo thành một bookmark riêng, kể cả khi URL đó đã có trong PinBook hoặc lặp lại nhiều lần trong cùng file.
- Hai thư mục hệ thống của trình duyệt ("Bookmarks bar" / "Other bookmarks") không được tạo thành thư mục riêng — link nằm trực tiếp trong đó (không thuộc thư mục con nào) sẽ vào thẳng **"Chưa phân loại"**, đúng như khi bạn xuất từ PinBook ra rồi nhập lại; thư mục con bên trong vẫn giữ nguyên cấu trúc như thường.
- Nếu nhập lại cùng một file, các **thư mục** trùng cả tên lẫn vị trí trong cây sẽ được gộp lại (không tạo thư mục trùng) — chỉ có bookmark là được thêm mới mỗi lần import, kể cả khi trùng URL.
- Nếu file export có kèm favicon, PinBook dùng tạm làm ảnh preview (thường hơi mờ vì icon nhỏ) — có thể sửa lại ảnh đẹp hơn sau.

### Xuất bookmark ra file HTML

Bấm nút **⋯** → **⬇ Xuất bookmark (.html)** — PinBook tải về một file `.html` chứa toàn bộ thư mục + bookmark hiện có, đúng chuẩn Netscape Bookmark format (chuẩn mà Chrome/Firefox/Edge dùng khi export). File này có thể:
- Nhập lại vào PinBook (qua **⬆ Nhập bookmark**) trên máy khác để mang toàn bộ dữ liệu sang.
- Nhập thẳng vào Chrome/Firefox/Edge qua `chrome://bookmarks` → **Import bookmarks**.

Lưu ý: định dạng HTML chuẩn này **không lưu được ảnh preview riêng** bạn đã tải lên/chụp trong PinBook (chỉ lưu được favicon nhỏ nếu có) — muốn giữ nguyên cả ảnh, dùng 2 tùy chọn bên dưới.

### Nhập / Xuất bookmark kèm ảnh Preview (định dạng riêng của PinBook)

- **⋯ → ⬇ Xuất bookmark kèm ảnh Preview**: tải về 1 file `.json` chứa đầy đủ cây thư mục + bookmark **kèm nguyên vẹn ảnh preview** bạn đã tải lên/chụp/dán link (không chỉ favicon nhỏ như bản HTML). Đây là cách sao lưu đầy đủ nhất, nên dùng khi muốn mang **toàn bộ** PinBook (kể cả ảnh) sang máy khác hoặc lưu dự phòng.
- **⋯ → ⬆ Nhập bookmark kèm ảnh Preview**: chọn lại đúng file `.json` đó để nhập vào — dựng lại cây thư mục, giữ nguyên ảnh preview của từng bookmark, đúng vị trí đã sắp xếp (kể cả xen kẽ thư mục/bookmark) và đúng thời điểm tạo gốc (nên thứ tự ở view "Tất cả" cũng được giữ nguyên). Thư mục trùng cả tên lẫn vị trí trong cây sẽ được gộp lại (không tạo trùng); bookmark thì luôn được thêm mới, kể cả khi trùng URL với bookmark đã có (giống chính sách của phần Nhập bookmark HTML ở trên). Bookmark/thư mục nằm ở cấp gốc trong file sẽ vào thẳng **"Chưa phân loại"**/cấp gốc thật, đúng như trước khi xuất — không bị gom vào thư mục trung gian nào.
- File `.json` này chỉ PinBook đọc được — không dùng để nhập vào Chrome/Firefox/Edge (muốn tương thích trình duyệt khác thì dùng bản Xuất HTML ở trên).

## Lưu ý kỹ thuật

- Dữ liệu (thư mục + link + ảnh) được lưu **hoàn toàn cục bộ** trong trình duyệt bằng IndexedDB, không gửi lên server nào cả.
- Ảnh giữ nguyên tỉ lệ khung hình gốc, chỉ nén/giảm kích thước nếu ảnh quá lớn (rộng hơn 1600px) để tiết kiệm dung lượng — không bao giờ bị bóp méo tỉ lệ.
- Muốn mang dữ liệu sang máy khác: dùng **⬇ Xuất bookmark** ở máy cũ rồi **⬆ Nhập bookmark** ở máy mới.
- PinBook lưu trữ độc lập, không đọc/ghi vào Bookmark gốc của Chrome — hai danh sách tách biệt nhau.
